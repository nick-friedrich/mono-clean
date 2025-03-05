import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Include all packages with test files
  'packages/*/vitest.config.ts',
]); 