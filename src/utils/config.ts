// utils/config.ts
import fs from 'fs';
import yaml from 'js-yaml';
import {z} from 'zod';
import {SecurityConfigSchema, SecurityConfigType} from "./schemas/securityConfig";
import {ProvidersConfig, ProvidersConfigType} from "./schemas/providersConfig";
import {logger} from "./logger";
import path from "node:path";

const ENV: "production" | "development" = process.env.NODE_ENV === "development" ? 'development' : 'production';
const configFilePrefix = ENV === 'production' ? 'production' : 'template';

const CONFIG_DIR = path.join(process.cwd(), 'config');
const SECURITY_CONFIG_FILE = path.join(CONFIG_DIR, `${configFilePrefix}.security.yaml`);
const PROVIDERS_CONFIG_FILE =path.join(CONFIG_DIR, `${configFilePrefix}.providers.yaml`);

/**
 * Ensures a config exists and returns the parsed YAML data.
 * @param configPath
 */
function ensureYamlConfig(configPath: string): any {
    try {
        logger.debug(`Loading config from ${configPath}`);
        if (fs.existsSync(configPath)) {
            const configFile = fs.readFileSync(configPath, 'utf8');
            // TODO use a safe parser
            return yaml.load(configFile);
        }
    } catch (error) {
        // Config file doesn't exist or is invalid, use defaults
        console.info(`Config file not found or invalid!`);
    }
}

export function loadSecurityConfig(): SecurityConfigType {
    return SecurityConfigSchema.parse(ensureYamlConfig(SECURITY_CONFIG_FILE));
}


export function loadProvidersConfig(): ProvidersConfigType {
    return ProvidersConfig.parse(ensureYamlConfig(PROVIDERS_CONFIG_FILE))
}

// Export the schema for type inference
export type SecurityConfig = z.infer<typeof SecurityConfigSchema>;
export type ProvidersConfig = z.infer<typeof ProvidersConfig>;
