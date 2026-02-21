import { Application } from 'express';
// import authRoutes from './routes/auth.routes';
// import userRoutes from './routes/user.routes';
import healthRoutes from './routes/health.routes';
import {setupOidcRoutes} from "./routes/auth.routes";

export async function setupRoutes(app: Application) {
  // Health check (no auth required)
  app.use('/health', healthRoutes);

  // OAuth2/OIDC endpoints
  await setupOidcRoutes(app)

  app.get('/', (req, res) => {
    res.json({
      message: 'Passage',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString()
    });
  });
}
