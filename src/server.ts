import { createApp } from './app';
import { logger } from './utils/logger';
import { loadSecurityConfig } from './utils/config';
import { connectDatabase } from './services/db';
import { gracefulShutdown } from './utils/gracefulShutdown';

async function bootstrap() {
  try {
    // Load configuration
    const securityConfig = loadSecurityConfig();

    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Create Express app
    const app = createApp({
      env: process.env.NODE_ENV || 'development',
      cors: securityConfig.cors,
      rateLimit: securityConfig.rateLimit
    });

    // Start server
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      logger.info(`🚀 O2IP server running on port ${PORT}`, {
        env: process.env.NODE_ENV || 'development',
        pid: process.pid
      });
    });

    // Graceful shutdown handling
    setupGracefulShutdown(server);

    return server;

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

function setupGracefulShutdown(server: any) {
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, starting graceful shutdown...`);

    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        await gracefulShutdown();
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', error);
        process.exit(1);
      }
    });

    // Force close after 30s
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Only run if this file is executed directly
if (require.main === module) {
  bootstrap();
}

export { bootstrap };
