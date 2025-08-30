// src/utils/config.ts
import yaml from 'js-yaml';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { join } from 'path';

const SecurityConfigSchema = z.object({
  cors: z.object({
    origins: z.array(z.string()),
    credentials: z.boolean(),
  }),
  rateLimit: z.object({
    windowMs: z.number(),
    max: z.number(),
  }),
  oauth2: z.object({
    issuer: z.string().url(),
    tokenExpiry: z.number(),
    refreshTokenExpiry: z.number(),
  }),
});

export function loadSecurityConfig(): z.infer<typeof SecurityConfigSchema> {
  const configPath = join(process.cwd(), 'config', 'security.yml');
  const yamlContent = readFileSync(configPath, 'utf8');
  const parsed = yaml.load(yamlContent);

  return SecurityConfigSchema.parse(parsed);
}
