# Clean Monorepo Architecture

Create a scalable monorepo architecture with pnpm workspaces.
For the mono repo we will use turborepo.

#### Packages: Contain the shared code for the apps.

- `@shared/config-typescript` - Shared TypeScript configurations for all packages and apps
- `@shared/db-drizzle-pg` - Drizzle ORM for PostgreSQL
- `@shared/repositories` - Layer of abstraction for the data access logic, contains the interface and the implementation for the database (for now Postgres with Drizzle and a Mock implementation)
- `@shared/modules` - Layer of abstraction for the business logic, contains the interface and the implementation for the business logic

#### Apps: Contain the code for the apps.

- `@apps/api-express` - API using Express
