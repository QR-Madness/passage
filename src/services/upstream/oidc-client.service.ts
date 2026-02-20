// src/services/upstream/oidc-client.service.ts
import * as client from 'openid-client';
import {ProviderEntryType} from '../../utils/schemas/config.schemas';
import {localKMS} from '../kms-local';
import {logger} from '../../utils/logger';

// In openid-client v6+, Configuration holds issuer metadata + client credentials
type ClientConfig = client.Configuration;

class UpstreamOidcService {
  private configs: Map<string, ClientConfig> = new Map();
  private initialized = false;

  /**
   * Initialize upstream OIDC clients for all configured providers.
   * Must be called after LocalKMS is initialized (for client secrets).
   */
  async initialize(providers: ProviderEntryType[]): Promise<void> {
    if (this.initialized) {
      logger.debug('UpstreamOidcService already initialized');
      return;
    }

    // TODO Add support for additional key services
    if (!localKMS.isInitialized()) {
      throw new Error('LocalKMS must be initialized before UpstreamOidcService');
    }

    logger.info('Initializing UpstreamOidcService');

    const oidcProviders = providers.filter(p =>
      p.auth_protocol === 'oidc' && p.OidcConfig?.upstream_issuer
    );

    for (const provider of oidcProviders) {
      try {
        await this.registerProvider(provider);
      } catch (error) {
        logger.error(`Failed to register upstream provider: ${provider.name}`, error);
        // Continue with other providers
      }
    }

    this.initialized = true;
    logger.info('UpstreamOidcService initialized', {
      providerCount: this.configs.size
    });
  }

  /**
   * Get the client configuration for a provider.
   */
  getConfig(providerName: string): ClientConfig | undefined {
    this.ensureInitialized();
    return this.configs.get(providerName);
  }

  /**
   * Build an authorization URL for redirecting to the upstream provider.
   */
  async buildAuthorizationUrl(
    providerName: string,
    redirectUri: string,
    options: {
      scope?: string;
      state?: string;
      nonce?: string;
      codeVerifier?: string; // For PKCE
    } = {}
  ): Promise<URL> {
    this.ensureInitialized();

    const config = this.configs.get(providerName);
    if (!config) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    const params: Record<string, string> = {
      redirect_uri: redirectUri,
      scope: options.scope || 'openid profile email',
      response_type: 'code',
    };

    if (options.state) params.state = options.state;
    if (options.nonce) params.nonce = options.nonce;

    // PKCE support
    if (options.codeVerifier) {
      const codeChallenge = await client.calculatePKCECodeChallenge(options.codeVerifier);
      params.code_challenge = codeChallenge;
      params.code_challenge_method = 'S256';
    }

    return client.buildAuthorizationUrl(config, params);
  }

  /**
   * Exchange an authorization code for tokens.
   * @param providerName - The registered provider name
   * @param callbackUrl - The full callback URL including query params (code, state, etc.)
   * @param options - Additional options for PKCE support
   */
  async exchangeCode(
    providerName: string,
    callbackUrl: URL,
    options?: {
      expectedState?: string;
      codeVerifier?: string;
    }
  ): Promise<client.TokenEndpointResponse> {
    this.ensureInitialized();

    const config = this.configs.get(providerName);
    if (!config) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    return client.authorizationCodeGrant(config, callbackUrl, {
      expectedState: options?.expectedState,
      pkceCodeVerifier: options?.codeVerifier,
    });
  }

  /**
   * Fetch user info from the upstream provider.
   * @param providerName - The registered provider name
   * @param accessToken - The access token from the upstream provider
   * @param expectedSubject - The expected 'sub' claim for validation
   */
  async fetchUserInfo(
    providerName: string,
    accessToken: string,
    expectedSubject: string
  ): Promise<client.UserInfoResponse> {
    this.ensureInitialized();

    const config = this.configs.get(providerName);
    if (!config) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    return client.fetchUserInfo(config, accessToken, expectedSubject);
  }

  /**
   * Check if a provider is registered.
   */
  hasProvider(providerName: string): boolean {
    this.ensureInitialized();
    return this.configs.has(providerName);
  }

  /**
   * Get all registered provider names.
   */
  getProviderNames(): string[] {
    this.ensureInitialized();
    return Array.from(this.configs.keys());
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Reset the service (for testing).
   */
  reset(): void {
    this.configs.clear();
    this.initialized = false;
  }

  /**
   * Register a single upstream provider by fetching its discovery document
   * and creating a client configuration.
   */
  private async registerProvider(provider: ProviderEntryType): Promise<void> {
    const oidcConfig = provider.OidcConfig;
    if (!oidcConfig?.upstream_issuer || !oidcConfig?.upstream_client_id) {
      throw new Error(`Provider ${provider.name} missing upstream_issuer or upstream_client_id`);
    }

    logger.debug(`Registering upstream provider: ${provider.name}`, {
      issuer: oidcConfig.upstream_issuer
    });

    // Resolve client secret from KMS if referenced
    let clientSecret: string | undefined;
    if (oidcConfig.upstream_client_secret_ref) {
      clientSecret = localKMS.getSecret(oidcConfig.upstream_client_secret_ref);
      if (!clientSecret) {
        throw new Error(`Secret not found: ${oidcConfig.upstream_client_secret_ref}`);
      }
    }

    // Discover issuer metadata and create configuration
    const config = await client.discovery(
      new URL(oidcConfig.upstream_issuer),
      oidcConfig.upstream_client_id,
      clientSecret
    );

    this.configs.set(provider.name, config);
    logger.info(`Registered upstream provider: ${provider.name}`);
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('UpstreamOidcService not initialized. Call initialize() first.');
    }
  }
}

// Export singleton instance
export const upstreamOidc = new UpstreamOidcService();

// Export class for testing
export {UpstreamOidcService};
