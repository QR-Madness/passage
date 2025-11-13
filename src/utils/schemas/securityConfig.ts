// Security configuration schema
import {z} from "zod";

export const SecurityConfigSchema = z.object({
  cors: z.object({
    origins: z.array(z.string()).default(['http://localhost:3000']),
    credentials: z.boolean().default(true)
  }),
  rateLimit: z.object({
    windowMs: z.number().default(15 * 60 * 1000), // 15 minutes
    max: z.number().default(100), // limit each IP to 100 requests per windowMs
    standardHeaders: z.boolean().default(true),
    legacyHeaders: z.boolean().default(false)
  }),
  headers: z.object({
    contentSecurityPolicy: z.boolean().default(true),
    hsts: z.object({
      maxAge: z.number().default(31536000),
      includeSubDomains: z.boolean().default(true),
      preload: z.boolean().default(true)
    }),
  }),
});

export type SecurityConfigType = z.infer<typeof SecurityConfigSchema>;
