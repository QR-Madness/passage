// utils/config.ts
import fs from 'fs';
import yaml from 'js-yaml';
import {z} from 'zod';
import path from 'path';
import {SecurityConfigSchema} from "./schemas/securityConfig";

// Default configuration for different environments
const defaultConfigs = {
  test: {
    cors: {
      origins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 1000, // Higher limit for tests
      standardHeaders: true,
      legacyHeaders: false
    },
    headers: {
      contentSecurityPolicy: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }
  },
  development: {
    cors: {
      origins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false
    },
    headers: {
      contentSecurityPolicy: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }
  },
  production: {
    cors: {
      origins: process.env.CORS_ORIGINS?.split(',') || ['https://yourdomain.com'],
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 50, // Stricter limit for production
      standardHeaders: true,
      legacyHeaders: false
    },
    headers: {
      contentSecurityPolicy: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }
  }
};

export function loadSecurityConfig(env?: string): z.infer<typeof SecurityConfigSchema> {
  const currentEnv = env || process.env.NODE_ENV || 'development';

  // Try to load from a config file first
  try {
    const configPath = path.join(process.cwd(), 'config', 'local.security.yaml');

    if (fs.existsSync(configPath)) {
      const configFile = fs.readFileSync(configPath, 'utf8');
      const yamlConfig = yaml.load(configFile);

      // Parse and validate the loaded config
      const result = SecurityConfigSchema.safeParse(yamlConfig);
      if (result.success) {
        return result.data;
      } else {
        console.warn('Invalid security config file, using defaults:', result.error);
      }
    }
  } catch (error) {
    // Config file doesn't exist or is invalid, use defaults
    console.info(`Config file not found or invalid, using default config for ${currentEnv}`);
  }

  // Fallback to environment-specific defaults
  const envConfig = defaultConfigs[currentEnv as keyof typeof defaultConfigs] || defaultConfigs.development;

  // Parse and validate the default config
  const result = SecurityConfigSchema.safeParse(envConfig);
  if (result.success) {
    return result.data;
  }

  // Ultimate fallback - return minimal config
  console.warn('Using minimal fallback security configuration');
  return SecurityConfigSchema.parse({});
}

// Export the schema for type inference
export type SecurityConfig = z.infer<typeof SecurityConfigSchema>;
