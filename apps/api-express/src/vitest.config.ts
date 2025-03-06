import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/dist/**"],
    coverage: {
      all: false,
      exclude: ["**/node_modules/**", "**/dist/**"]
    }
  }
})