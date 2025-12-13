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

    it('discovery endpoint should return 200', async () => {
        // TODO Integrate with the actual OIDC provider
        await context.request(context.app)
            .post('/auth/oidc/.well-known/openid-configuration')
            .expect(200);
    });
});
