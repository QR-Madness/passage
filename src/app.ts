import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

import { loadSecurityConfig } from './utils/config';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

export interface AppConfig {
  env: string;
  cors?: {
    origins: string[];
    credentials: boolean;
  };
  rateLimit?: {
    windowMs: number;
    max: number;
  };
}

export function createApp(config?: Partial<AppConfig>) {
  const app = express();

  // Load security configuration
  const securityConfig = loadSecurityConfig();

  // Trust proxy (important for rate limiting behind reverse proxy)
  app.set('trust proxy', 1);

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // CORS
  app.use(cors({
    origin: config?.cors?.origins || securityConfig.cors.origins,
    credentials: config?.cors?.credentials ?? securityConfig.cors.credentials,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Compression
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 1024
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Setup middleware (rate limiting, logging, etc.)
  setupMiddleware(app, securityConfig);

  // Setup routes
  setupRoutes(app);

  // Global error handler (keep this here for now)
  app.use(errorHandler);

  logger.info('Express app created successfully', {
    env: config?.env || 'development'
  });

  return app;
}
