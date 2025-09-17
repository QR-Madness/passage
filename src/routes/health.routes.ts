
import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version?: string;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn';
      time?: string;
      output?: string;
      observedValue?: any;
      observedUnit?: string;
    };
  };
}

interface SystemInfo {
  nodejs: string;
  platform: string;
  architecture: string;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
}

// Cache for expensive checks (TTL: 30 seconds)
let healthCache: { data: HealthStatus; timestamp: number } | null = null;
const CACHE_TTL = 30 * 1000; // 30 seconds

/**
 * Basic health check endpoint
 * GET /health
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const healthStatus = await getHealthStatus();

    // Set appropriate HTTP status based on health
    const httpStatus = healthStatus.status === 'healthy' ? 200 :
      healthStatus.status === 'degraded' ? 200 : 503;

    res.status(httpStatus).json(healthStatus);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: 'Health check system failure'
    });
  }
});

/**
 * Detailed health check with system information
 * GET /health/detailed
 */
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const healthStatus = await getHealthStatus(true);
    const systemInfo = getSystemInfo();

    const detailedHealth = {
      ...healthStatus,
      system: systemInfo,
      environment: {
        node_env: process.env.NODE_ENV || 'development',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    const httpStatus = healthStatus.status === 'healthy' ? 200 :
      healthStatus.status === 'degraded' ? 200 : 503;

    res.status(httpStatus).json(detailedHealth);
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Detailed health check system failure'
    });
  }
});

/**
 * Readiness probe endpoint (for Kubernetes)
 * GET /health/ready
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    const isReady = await checkReadiness();

    if (isReady) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        message: 'Service is not ready to accept traffic'
      });
    }
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: 'Readiness check failed'
    });
  }
});

/**
 * Liveness probe endpoint (for Kubernetes)
 * GET /health/live
 */
router.get('/live', (req: Request, res: Response) => {
  // Simple liveness check - if we can respond, we're alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Startup probe endpoint (for Kubernetes)
 * GET /health/startup
 */
router.get('/startup', async (req: Request, res: Response) => {
  try {
    const hasStarted = await checkStartup();

    if (hasStarted) {
      res.status(200).json({
        status: 'started',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'starting',
        timestamp: new Date().toISOString(),
        message: 'Service is still starting up'
      });
    }
  } catch (error) {
    logger.error('Startup check failed:', error);
    res.status(503).json({
      status: 'failed_startup',
      timestamp: new Date().toISOString(),
      error: 'Startup check failed'
    });
  }
});

/**
 * Get comprehensive health status
 */
async function getHealthStatus(skipCache = false): Promise<HealthStatus> {
  // Return cached result if available and not expired
  if (!skipCache && healthCache && (Date.now() - healthCache.timestamp) < CACHE_TTL) {
    return healthCache.data;
  }

  const checks: HealthStatus['checks'] = {};
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  // Database connectivity check
  try {
    const dbStatus = await checkDatabase();
    checks.database = dbStatus;
    if (dbStatus.status === 'fail') {
      overallStatus = 'unhealthy';
    } else if (dbStatus.status === 'warn' && overallStatus === 'healthy') {
      overallStatus = 'degraded';
    }
  } catch (error) {
    checks.database = {
      status: 'fail',
      output: error instanceof Error ? error.message : 'Database check failed'
    };
    overallStatus = 'unhealthy';
  }

  // Memory usage check
  const memoryStatus = checkMemory();
  checks.memory = memoryStatus;
  if (memoryStatus.status === 'warn' && overallStatus === 'healthy') {
    overallStatus = 'degraded';
  }

  // Disk space check (if applicable)
  try {
    const diskStatus = await checkDiskSpace();
    checks.disk = diskStatus;
    if (diskStatus.status === 'fail') {
      overallStatus = 'unhealthy';
    } else if (diskStatus.status === 'warn' && overallStatus === 'healthy') {
      overallStatus = 'degraded';
    }
  } catch (error) {
    // Disk check is optional - don't fail health check if not available
    logger.warn('Disk space check unavailable:', error);
  }

  // External dependencies check (optional)
  try {
    const externalStatus = await checkExternalDependencies();
    checks.external_dependencies = externalStatus;
    if (externalStatus.status === 'fail') {
      // External deps failure might be degraded rather than unhealthy
      // depending on your service's requirements
      if (overallStatus === 'healthy') {
        overallStatus = 'degraded';
      }
    }
  } catch (error) {
    checks.external_dependencies = {
      status: 'warn',
      output: 'External dependency check failed'
    };
  }

  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || 'unknown',
    checks
  };

  // Cache the result
  healthCache = {
    data: healthStatus,
    timestamp: Date.now()
  };

  return healthStatus;
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthStatus['checks']['database']> {
  try {
    // TODO: Replace with your actual database connection check
    // Example for PostgreSQL:
    // const client = await pool.connect();
    // await client.query('SELECT 1');
    // client.release();

    // For now, simulate a database check
    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, 1)); // Simulate DB query
    const duration = Date.now() - start;

    return {
      status: 'pass',
      time: new Date().toISOString(),
      output: 'Database connection successful',
      observedValue: duration,
      observedUnit: 'ms'
    };
  } catch (error) {
    return {
      status: 'fail',
      time: new Date().toISOString(),
      output: error instanceof Error ? error.message : 'Database connection failed'
    };
  }
}

/**
 * Check memory usage
 */
function checkMemory(): HealthStatus['checks']['memory'] {
  const memUsage = process.memoryUsage();
  const totalMem = memUsage.heapTotal;
  const usedMem = memUsage.heapUsed;
  const memPercentage = (usedMem / totalMem) * 100;

  let status: 'pass' | 'warn' | 'fail' = 'pass';
  if (memPercentage > 90) {
    status = 'fail';
  } else if (memPercentage > 80) {
    status = 'warn';
  }

  return {
    status,
    time: new Date().toISOString(),
    observedValue: Math.round(memPercentage),
    observedUnit: 'percent',
    output: `Memory usage: ${Math.round(memPercentage)}%`
  };
}

/**
 * Check disk space (optional)
 */
async function checkDiskSpace(): Promise<HealthStatus['checks']['disk']> {
  try {
    // This is a simplified check - in production you might use statvfs or similar
    // For now, we'll simulate it
    return {
      status: 'pass',
      time: new Date().toISOString(),
      output: 'Sufficient disk space available'
    };
  } catch (error) {
    throw new Error('Disk space check not implemented');
  }
}

/**
 * Check external dependencies
 */
async function checkExternalDependencies(): Promise<HealthStatus['checks']['external_dependencies']> {
  try {
    // TODO: Check external services your OAuth2 service depends on
    // Examples: upstream identity providers, key management services, etc.

    return {
      status: 'pass',
      time: new Date().toISOString(),
      output: 'All external dependencies accessible'
    };
  } catch (error) {
    return {
      status: 'fail',
      time: new Date().toISOString(),
      output: error instanceof Error ? error.message : 'External dependency check failed'
    };
  }
}

/**
 * Check if service is ready to accept traffic
 */
async function checkReadiness(): Promise<boolean> {
  try {
    // Check if all critical components are initialized
    // Examples: database connections, key loading, config validation

    // TODO: Add your specific readiness checks here
    // const dbReady = await isDatabaseReady();
    // const keysReady = await areKeysLoaded();
    // const configReady = await isConfigValid();
    // return dbReady && keysReady && configReady;

    return true; // Simplified for now
  } catch (error) {
    logger.error('Readiness check failed:', error);
    return false;
  }
}

/**
 * Check if service has completed startup
 */
async function checkStartup(): Promise<boolean> {
  try {
    // Check if the service has fully started
    // This is typically more lenient than readiness

    // TODO: Add your specific startup checks here
    return process.uptime() > 5; // Simple uptime check
  } catch (error) {
    logger.error('Startup check failed:', error);
    return false;
  }
}

/**
 * Get system information
 */
function getSystemInfo(): SystemInfo {
  const memUsage = process.memoryUsage();
  const totalMem = memUsage.heapTotal;
  const usedMem = memUsage.heapUsed;

  return {
    nodejs: process.version,
    platform: process.platform,
    architecture: process.arch,
    memory: {
      used: Math.round(usedMem / 1024 / 1024), // MB
      total: Math.round(totalMem / 1024 / 1024), // MB
      percentage: Math.round((usedMem / totalMem) * 100)
    },
    cpu: {
      usage: Math.round(process.cpuUsage().user / 1000) // Simplified CPU usage
    }
  };
}

export default router;
