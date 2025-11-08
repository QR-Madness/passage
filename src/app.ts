import express from 'express';

import { loadSecurityConfig } from './utils/config';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
import { logger } from './utils/logger';

export interface AppConfig {
  // TODO Type these to their respective config schema
  coreConfig: any;
  securityConfig: any;
  providersConfig: any;
}

export function createApp() {
  const app = express();

  // Trust proxy (important for rate limiting behind reverse proxy)
  // See more -> https://stackoverflow.com/a/23426060
  app.set('trust proxy', 1);

  // Setup middleware and routes (automatic harness to mount middleware and routes)
  setupMiddleware(app);
  setupRoutes(app);

  logger.info('Express app created successfully', {
    env: 'development'
  });

  return app;
}
