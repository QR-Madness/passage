/**
 * @file src/middleware/commonMiddleware.ts
 * @description Common middleware functions for the application (e.g CORS, helmet, etc.)
 */
import MiddlewareComponent from "./middlewareComponent";
import express from "express";
import {logger} from "../utils/logger";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";

export default class CommonMiddleware implements MiddlewareComponent {
    mount(app: express.Application): boolean {
      // CORS
      app.use(cors({
        // origin: config?.cors?.origins || securityConfig.cors.origins,
        // credentials: config?.cors?.credentials ?? securityConfig.cors.credentials,
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

      app.use(express.text({limit: '10mb'}));
      app.use(express.json({ limit: '10mb' }));
      app.use(express.urlencoded({ extended: true, limit: '10mb' }));
      // ---
      logger.info(`CommonMiddleware mounted at ${new Date().toISOString()}`);
      return true;
    }
}
