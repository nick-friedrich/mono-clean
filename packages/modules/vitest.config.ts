import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/schema/*.ts", "**/*.config.ts", "**/drizzle.config.ts"],
    coverage: {
      all: false,
      exclude: ["**/node_modules/**", "**/schema/*.ts", "**/*.config.ts", "**/*.config.ts"]
    }
  }
})