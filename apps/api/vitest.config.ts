import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Integration tests hit skillsum_test — run serially to avoid truncation races.
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://skillsum:skillsum_dev@localhost:5432/skillsum_test',
    },
  },
});
