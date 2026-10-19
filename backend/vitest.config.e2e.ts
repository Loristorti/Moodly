import { config } from 'dotenv';
import { defineConfig } from 'vitest/config';

// e2e tests always run against the moodly_test database, configured in .env.test
const testEnv = config({ path: '.env.test', quiet: true }).parsed;
if (!testEnv) {
  throw new Error('Missing backend/.env.test: copy .env.test.example');
}

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    env: testEnv,
    globalSetup: ['./test/global-setup.ts'],
    // Test files share the same database: run them one after the other
    fileParallelism: false,
  },
});
