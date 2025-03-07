import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [
      "**/node_modules/**",
      "**/schema/*.ts",
      "**/*.config.ts",
      "**/drizzle.config.ts",
      "**/coverage/**"
    ],
    coverage: {
      all: true,
      exclude: [
        "**/vitest.config.ts",
        "**/vitest.*.ts",
        "**/node_modules/**",
        "**/schema/*.ts",
        "**/*.config.ts",
        "**/*.config.ts",
        "**/coverage/**",
        "./apps/api-express/src/index.ts"
      ]
    }
  }
})