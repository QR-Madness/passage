// tests/test-utils.ts
import { createApp } from '../app';
import request, {Test} from 'supertest';

export interface TestContext {
  app: any;
  request: typeof request;
  testData: Map<string, any>;
}

export class TestEnvironment {
  private contexts: Map<string, TestContext> = new Map();

  /**
   * Creates and initializes a new test context with the specified name.
   *
   * @param {string} [name='default'] - The name of the context to create.
   * Defaults to 'default' if not specified.
   * @return {Promise<TestContext>} A promise that resolves to the created TestContext object.
   */
  async createContext(name: string = 'default'): Promise<TestContext> {
    const app = createApp({
      env: 'test',
      // Add any test-specific overrides
      // database: {
      //   url: process.env.TEST_DATABASE_URL || 'memory://test'
      // }
    });

    const context: TestContext = {
      app,
      request,
      testData: new Map()
    };

    this.contexts.set(name, context);
    return context;
  }

  getContext(name: string = 'default'): TestContext | undefined {
    return this.contexts.get(name);
  }

  async cleanup(name?: string): Promise<void> {
    if (name) {
      const context = this.contexts.get(name);
      if (context?.app?.close) {
        await context.app.close();
      }
      this.contexts.delete(name);
    } else {
      // Clean all contexts
      for (const [contextName, context] of this.contexts) {
        if (context.app?.close) {
          await context.app.close();
        }
      }
      this.contexts.clear();
    }
  }
}

// Test data builders for maintainable test data
export const TestDataBuilders = {
  user: (overrides = {}) => ({
    id: 'test-user-' + Math.random().toString(36).substr(2, 9),
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    ...overrides
  }),

  authRequest: (overrides = {}) => ({
    client_id: 'test-client',
    response_type: 'code',
    redirect_uri: 'http://localhost:3000/callback',
    scope: 'openid profile email',
    state: 'test-state-' + Math.random().toString(36).substr(2, 9),
    ...overrides
  })
};

// Helper functions for common test operations
export const TestHelpers = {
  async authenticateUser(context: TestContext, userData = {}): Promise<any> {
    const user = TestDataBuilders.user(userData);
    context.testData.set('currentUser', user);

    // Simulate authentication
    const response = await context.request(context.app)
      .post('/auth/test-login')
      .send(user);

    return response;
  },

  async makeAuthenticatedRequest(
    context: TestContext,
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any
  ): Promise<Test> {
    const user = context.testData.get('currentUser');
    if (!user) {
      throw new Error('No authenticated user in test context');
    }

    let req = context.request(context.app)[method](url);

    // Add authentication headers
    req = req.set('Authorization', `Bearer test-token-${user.id}`);

    if (data && (method === 'post' || method === 'put')) {
      req = req.send(data);
    }

    return req;
  }
};
