Create a scalable monorepo architecture with pnpm workspaces.
For the mono repo we will use turborepo.

Packages: Contain the shared code for the apps.

- `@shared/config-typescript` - Shared TypeScript configurations for all packages and apps
- `@shared/db-drizzle-pg` - Drizzle ORM for PostgreSQL
- `@shared/repositories` - Layer that contains the unspecific data access logic
- `@shared/repositories-drizzle-pg` - Repository layer that contains the data access logic for the PostgreSQL database
- `@shared/repositories-...` - Other repository implementations

Apps: Contain the code for the apps.

- `@apps/api-hono` - API layer using Hono
- `@apps/web-react-router-v7` - Web layer using React Router v7
