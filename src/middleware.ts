import { Application } from 'express';
// import { setupRateLimit } from './middleware/rateLimit';
// import { setupRequestLogger } from './middleware/requestLogger';
// import { setupValidation } from './middleware/validator';

export function setupMiddleware(app: Application, securityConfig: any) {
  // Request logging
  // setupRequestLogger(app);

  // Rate limiting
  // setupRateLimit(app, securityConfig.rateLimit);

  // Input validation
  // setupValidation(app);
}
