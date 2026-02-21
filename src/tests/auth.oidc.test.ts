// tests/auth.example.test.ts
import {describe, it, after, before} from "node:test";
import {TestEnvironment, TestContext} from './test-utils';

describe('OIDC Authentication Tests', () => {
    let testEnv: TestEnvironment;
    let context: TestContext;

    before(async () => {
        testEnv = new TestEnvironment();
        context = await testEnv.createContext("oidc-tests");
    });

    after(async () => {
        await testEnv.cleanup();
    });

    it('discovery endpoint should emit metadata and return 200', async () => {
        const res = await context.request(context.app)
            .post('/oidc-example/.well-known/openid-configuration')
            .expect(200);

        const data = res.body;
        // TODO Validate response data
    });
});
