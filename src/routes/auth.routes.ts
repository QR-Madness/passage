import { serverApp, providersConfig } from "../server"
import {ProviderEntryType} from "../utils/schemas/providersConfig";


/**
 * Sets up a route-system for the specified OIDC provider.
 * @param provider OIDC provider configuration
 */
export function setupOidcRoutes(provider: ProviderEntryType) {
    console.log(`Setting up OIDC routes for provider: ${provider.name}`);

    // TODO Add routes for OIDC provider

    serverApp.get(`/${provider.ServerConfig.endpoint_url}/.well-known/openid-configuration`, (req, res) => {
        res.send("Callback")
    });
}


/**
 * Sets up routes for all providers scoped in the configuration.
 */
export function setupAuthRoutes() {
    for (const provider of providersConfig.providers) {
        if (provider.auth_protocol === "oidc") setupOidcRoutes(provider)
    }
}
