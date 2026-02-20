# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Passage is an identity broker/OAuth2/OIDC platform built with Express.js 5 and TypeScript, using Bun as the runtime. It acts as a federation layer that authenticates users via upstream OIDC providers (Keycloak, Auth0, etc.) and issues Passage-signed tokens to downstream clients.

## Commands

### Development
```bash
bun run express-dev          # Start server with NODE_ENV=development
task server:dev              # Same via Taskfile
```

### Testing
```bash
bun test                     # Run all tests
bun test src/tests/health.test.ts  # Run single test file
bun test --watch             # Watch mode
task test                    # Runs tests with docker-compose services (launches then tears down)
```

### Build
```bash
bun run build                # TypeScript compilation to dist/
task build                   # Build app + Docker image
```

### Services
```bash
task launch                  # Start docker-compose services (Keycloak, MongoDB)
task teardown                # Stop docker-compose services
```

### Documentation (Docusaurus)
```bash
bun run docs:start           # Dev server
bun run docs:build           # Build static site
```

## Architecture

### Application Bootstrap Flow
1. `src/server.ts` - Entry point; loads YAML configs, creates app, initializes services (LocalKMS)
2. `src/app.ts` - Creates Express app, calls `setupMiddleware()` and `setupRoutes()`
3. `src/middleware.ts` - Mounts middleware components in order
4. `src/routes.ts` - Mounts route handlers

### Configuration System
- YAML-based configs in `config/` directory
- Environment-aware: uses `template.*.yaml` in development, `production.*.yaml` in production
- Configs validated with Zod schemas in `src/utils/schemas/`
- Key files:
  - `config/template.providers.yaml` - Provider definitions
  - `config/template.security.yaml` - Security settings
  - `config/template.secrets.yaml` - Secrets (encrypted by LocalKMS)

### Middleware Pattern
Middleware extends `MiddlewareComponent` abstract class (`src/middleware/middlewareComponent.ts`) and implements `mount(app)` method. Add new middleware in `src/middleware.ts`.

### Services
- `src/services/kms-local.ts` - Local KMS singleton for secret encryption/decryption using AES-256-GCM. Encrypts plaintext values in secrets.yaml on first run and stores master key in `kms-local.keystore`.

### Test Infrastructure
- Uses Bun's test runner with supertest
- `src/tests/test-utils.ts` provides:
  - `TestEnvironment` - Creates isolated test contexts with Express app
  - `TestDataBuilders` - Factory functions for test data (users, OIDC requests, tokens)
  - `MockProviderUtils` - Create mock OIDC discovery documents, JWTs
  - `TestHelpers` - Authenticated request helpers
  - `AsyncUtils` - Retry/polling utilities

### Provider Configuration Schema
Providers are defined in `src/utils/schemas/providersConfig.ts` with:
- `name`, `auth_protocol`, `ServerConfig.endpoint_url`, `ServerConfig.client_id`
- `OidcConfig` for upstream federation (issuer, client credentials via KMS reference, scopes)
- `TestConfig` for test environment settings

## Key Patterns

- **Singleton Services**: See `LocalKMS` pattern - class with singleton export, deferred initialization via `initialize()`, `isInitialized()` guard
- **Zod Validation**: All configs and request schemas use Zod; types exported via `z.infer<typeof Schema>`
- **YAML Config**: Use `js-yaml` for loading, configs are environment-prefixed

## Docker Compose Services

- `keycloak` (port 8080) - Mock upstream OIDC provider with Postgres backend
- `mongo` (port 27017) - MongoDB for storage testing
- `passage` - The application container