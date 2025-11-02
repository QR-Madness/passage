import { Application } from 'express';
// import authRoutes from './routes/auth.routes';
// import userRoutes from './routes/user.routes';
import healthRoutes from './routes/health.routes';

export function setupRoutes(app: Application) {
  // Health check (no auth required)
  app.use('/health', healthRoutes);

  // OAuth2/OIDC endpoints
  // app.use('/oauth', authRoutes);

  // User management
  // app.use('/api/users', userRoutes);

  // Well-known endpoints
  // app.use('/.well-known', authRoutes);

  app.get('/', (req, res) => {
    res.json({
      message: 'Passage',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString()
    });
  });

}
