import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Include all packages with test files
  'packages/*/vitest.config.ts',
  // Include all apps with test files
  'apps/*/src/vitest.config.ts',
]); 