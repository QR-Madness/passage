import { serverApp, providersConfig } from "../server"
import {ProviderEntryType} from "../utils/schemas/config.schemas";


/**
 * Attaches a route-system for the specified OIDC provider onto the Express application.
 * @param provider OIDC provider configuration
 */
export function setupOidcProviderRoutes(provider: ProviderEntryType) {
    console.log(`Setting up OIDC routes for provider: ${provider.name}`);

    // TODO Add routes for OIDC provider

    // TODO Discovery Endpoint
    serverApp.get(`/${provider.ServerConfig.endpoint_url}/.well-known/openid-configuration`, (req, res) => {
        res.send("Callback")
    });

    // TODO Authorization Endpoint
    // TODO Token Endpoint
    // TODO UserInfo Endpoint
    // TODO JWKS Endpoint
    // TODO OPT Introspection Endpoint
    // TODO OPT Revocation Endpoint
    // TODO OPT End Session Endpoint
    // TODO OPT Registration Endpoint
    // TODO OPT Device Authorization Endpoint
}


/**
 * Sets up routes for all providers scoped in the configuration.
 */
export function setupProviderRoutes() {
    for (const provider of providersConfig.providers) {
        if (provider.auth_protocol === "oidc") setupOidcProviderRoutes(provider)
    }
}
