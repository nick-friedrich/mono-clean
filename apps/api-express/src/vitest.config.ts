import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/dist/**"],
    coverage: {
      all: true,
      include: ["**/*.ts", "**/*.tsx"],
      exclude: ["**/node_modules/**", "**/dist/**", "**/*.test.ts", "**/*.config.ts", "./index.ts"],
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    }
  }
})