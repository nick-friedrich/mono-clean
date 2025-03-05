# @shared/config-typescript

Shared TypeScript configurations for the monorepo.

## Configurations

- `base.json`: Base TypeScript configuration
- `react-library.json`: Configuration for React libraries
- `next.json`: Configuration for Next.js applications

## Usage

In your package's `tsconfig.json`:

```json
{
  "extends": "@shared/config-typescript/base.json",
  // Add your package-specific configurations here
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

For React libraries:

```json
{
  "extends": "@shared/config-typescript/react-library.json",
  // Add your package-specific configurations here
}
```

For Next.js applications:

```json
{
  "extends": "@shared/config-typescript/next.json",
  // Add your package-specific configurations here
}
```
