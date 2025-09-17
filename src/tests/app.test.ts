// tests/app.test.ts
import { createApp } from '../app';
import { describe, it, beforeEach, afterEach } from "node:test";
import request from 'supertest';
import { strict as assert } from 'node:assert';
import {Express} from "express";

// Test state management
interface TestState {
  app: Express | null;
  testData: Map<string, any>;
}

class TestStateManager {
  private state: TestState;

  constructor() {
    this.state = {
      app: null,
      testData: new Map()
    };
  }

  async setup(): Promise<void> {
    // Clean state for each test
    this.state.app = createApp({ env: 'test' });
    this.state.testData.clear();
    // TODO register graceful shutdown handlers
  }

  async teardown(): Promise<void> {
    // Clean up any resources
    this.state.testData.clear();
    // TODO use graceful shutdown
  }

  getApp(): any {
    return this.state.app;
  }

  setTestData(key: string, value: any): void {
    this.state.testData.set(key, value);
  }

  getTestData(key: string): any {
    return this.state.testData.get(key);
  }

  hasTestData(key: string): boolean {
    return this.state.testData.has(key);
  }
}


describe('OAuth2 App', () => {
  let testStateManager: TestStateManager;

  // Setup and teardown for each test
  beforeEach(async () => {
    testStateManager = new TestStateManager();
    await testStateManager.setup();
  });
  afterEach(async () => {
    await testStateManager.teardown();
  });

  it('should respond to health checks', async () => {
    const app = testStateManager.getApp();

    const response = await request(app)
      .get('/health')
      .expect(200);

    assert.strictEqual(response.body.status, 'healthy');
  });

  // it('should handle authentication flow', async () => {
  //   const app = testStateManager.getApp();
  //
  //   // Store test data for this specific test
  //   testStateManager.setTestData('testUser', { id: 'test-123', email: 'test@example.com' });
  //
  //   const response = await request(app)
  //     .post('/auth/login')
  //     .send({ email: 'test@example.com', password: 'testpass' })
  //     .expect(401); // Assuming this should fail without proper setup
  //
  //   // Verify test data is accessible
  //   assert.ok(testStateManager.hasTestData('testUser'));
  // });
});
