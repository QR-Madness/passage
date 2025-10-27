// tests/auth.test.ts
import { describe, it, beforeEach, afterEach } from "node:test";
import { TestEnvironment, TestDataBuilders, TestHelpers } from './test-utils';

describe('Authentication Tests', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = new TestEnvironment();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  // it('should handle OAuth2 authorization flow', async () => {
  //   const context = await testEnv.createContext('auth-test');
  //
  //   // Build test data
  //   const authRequest = TestDataBuilders.authRequest({
  //     client_id: 'valid-client',
  //     scope: 'openid profile'
  //   });
  //
  //   // Store in test context for later use
  //   context.testData.set('authRequest', authRequest);
  //
  //   const response = await context.request(context.app)
  //     .get('/auth/authorize')
  //     .query(authRequest)
  //     .expect(302); // Should redirect to login
  //
  //   assert.ok(response.headers.location);
  //   assert.ok(response.headers.location.includes('login'));
  // });
  //
  // it('should authenticate user and return token', async () => {
  //   const context = await testEnv.createContext('user-auth');
  //
  //   // Create and authenticate test user
  //   const authResponse = await TestHelpers.authenticateUser(context, {
  //     email: 'integration@test.com',
  //     name: 'Integration Test User'
  //   });
  //
  //   assert.strictEqual(authResponse.status, 200);
  //   assert.ok(context.testData.has('currentUser'));
  //
  //   // Make authenticated request
  //   const protectedResponse = await TestHelpers.makeAuthenticatedRequest(
  //     context,
  //     'get',
  //     '/user/profile'
  //   )
  //
  //   assert.ok(protectedResponse.status == 200)
  //
  //   const user = context.testData.get('currentUser');
  //   assert.strictEqual(protectedResponse.body.email, user.email);
  // });
  //
  // it('should handle multiple concurrent test contexts', async () => {
  //   const context1 = await testEnv.createContext('user1');
  //   const context2 = await testEnv.createContext('user2');
  //
  //   // Each context maintains independent state
  //   await TestHelpers.authenticateUser(context1, { name: 'User One' });
  //   await TestHelpers.authenticateUser(context2, { name: 'User Two' });
  //
  //   const user1 = context1.testData.get('currentUser');
  //   const user2 = context2.testData.get('currentUser');
  //
  //   assert.notEqual(user1.id, user2.id);
  //   assert.strictEqual(user1.name, 'User One');
  //   assert.strictEqual(user2.name, 'User Two');
  // });
});
