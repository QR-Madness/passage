import express from 'express';

import { loadSecurityConfig } from './utils/config';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
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

  setupMiddleware(app);
  setupRoutes(app);

  logger.info('Express app created successfully', {
    env: config?.env || 'development'
  });

  return app;
}
