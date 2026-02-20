import {providersConfig, serverApp} from "../server"
import {ProviderEntryType} from "../utils/schemas/config.schemas";
import {upstreamOidc} from "../services/upstream/oidc-client.service";
import {logger} from "../utils/logger";


/**
 * Attaches a route-system for the specified OIDC provider onto the Express application.
 * @param provider OIDC provider configuration
 */
export function setupOidcProviderRoutes(provider: ProviderEntryType) {
  const basePath = `/${provider.ServerConfig.endpoint_url}`;
  logger.debug(`Setting up OIDC routes for provider: ${provider.name} at ${basePath}`);

  // Discovery Endpoint - returns the upstream provider's metadata
  serverApp.get(`${basePath}/.well-known/openid-configuration`, (req, res) => {
    try {
      const config = upstreamOidc.getConfig(provider.name);
      // serverMetadata() returns the OIDC discovery document (AuthorizationServer)
      res.json(config.serverMetadata());
    } catch (error: any) {
      logger.error(`Discovery error for ${provider.name}:`, error);
      res.status(500).json({error: error.message});
    }
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

  logger.debug(`Routes for provider ${provider.name} set up`);
}


/**
 * Sets up routes for all providers scoped in the configuration.
 */
export async function setupProviderRoutes() {
  const oidcProviders = providersConfig.providers.filter(p => p.auth_protocol === 'oidc');

  // Initialize upstream OIDC factory (fetches discovery docs)
  await upstreamOidc.initialize(oidcProviders);
  logger.debug(`Initialized upstream OIDC factory for ${oidcProviders.length} providers`);

  // Build routes for each OIDC provider
  for (const provider of oidcProviders) {
    setupOidcProviderRoutes(provider);
  }
}
