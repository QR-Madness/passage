// tests/health.test.ts
import { describe, it, beforeEach, afterEach } from "node:test";
import { TestEnvironment } from './test-utils';

describe('Health Routes', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = new TestEnvironment();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  it('Should return healthy status', async () => {
    const context = await testEnv.createContext("health-test");
    const response = context.request(context.app).get('/health')
    response.expect(200)
  })
});
