## Usage

```ts
// Import interfaces
import { UserRepositoryInterface } from "@shared/repository/interface";

// Import specific implementation
import { DrizzleUserRepository } from "@shared/repository/drizzle";

// Using the factory (recommended approach)
import { getUserRepository } from "@shared/repository/factory";
const userRepo = getUserRepository("drizzle");

// Using pre-instantiated singleton (convenience)
import { userRepository } from "@shared/repository/drizzle";
```
