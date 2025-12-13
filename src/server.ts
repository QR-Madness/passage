import {createApp} from './app';
import {logger} from './utils/logger';
import {loadProvidersConfig, loadSecurityConfig} from './utils/config';
import {gracefulShutdown} from './utils/gracefulShutdown';
import {ProvidersConfigType} from "./utils/schemas/providersConfig";
import {SecurityConfigType} from "./utils/schemas/securityConfig";
import express from "express";

export let serverApp: express.Application;
export let providersConfig: ProvidersConfigType;
export let securityConfig: SecurityConfigType;

async function bootstrap() {
    try {
        // Load configuration(s)
        // TODO Use a config manager to cache configs with attachable fetchers
        const securityConfig: SecurityConfigType = loadSecurityConfig();
        const providersConfig: ProvidersConfigType = loadProvidersConfig();

        // Database connection(s)
        // await connectDatabase();

        // Create Express app
        const app = createApp();

        // Start server
        const PORT = process.env.PORT || 3000;
        const server = app.listen(PORT, () => {
            logger.info(`🚀 Passage server (Express.js) running on port ${PORT}`, {
                env: process.env.NODE_ENV || 'development',
                pid: process.pid
            });
        });

        // Graceful shutdown handling
        setupGracefulShutdown(server);

        serverApp = app;
        return server;
    } catch (error) {
        logger.error('Failed to start server', error);
        process.exit(1);
    }
}

/**
 * Set up graceful shutdown handlers for the HTTP server.
 * @param server The HTTP server instance.
 */
function setupGracefulShutdown(server: any) {
    const shutdown = async (signal: string) => {
        logger.info(`Received ${signal}, starting graceful shutdown...`);

        server.close(async () => {
            logger.info('HTTP server closed');

            try {
                await gracefulShutdown();
                logger.info('Graceful shutdown completed');
                process.exit(0);
            } catch (error) {
                logger.error('Error during shutdown', error);
                process.exit(1);
            }
        });

        // Force close after 30s
        setTimeout(() => {
            logger.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}

// Only run if this file is executed directly
if (require.main === module) {
    bootstrap().then(r => {
        logger.info('Server started');
    });
}

export {bootstrap};
