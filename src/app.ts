import express from 'express';

import {ENV as env} from './utils/config';
import {setupMiddleware} from './middleware';
import {setupRoutes} from './routes';
import {logger} from './utils/logger';

export interface AppConfig {
  // TODO Type these to their respective config schema
  coreConfig: any;
  securityConfig: any;
  providersConfig: any;
}

export async function createApp() {
  const app = express();

  // Trust proxy (important for rate limiting behind reverse proxy)
  // See more -> https://stackoverflow.com/a/23426060
  app.set('trust proxy', 1);

  // Set up middleware and routes (automatic harness to mount middleware and routes)
  setupMiddleware(app);
  await setupRoutes(app);

  logger.info('Passage server instance created...', {
    env, pid: env == "development" ? process.pid : undefined,
  })

  return app;
}
