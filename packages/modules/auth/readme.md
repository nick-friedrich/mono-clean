# Usage example

```ts
// Import the default instance
import { auth } from "@modules/auth";

// Use the auth service
async function login(email: string, password: string) {
  try {
    const result = await auth.authService.signInWithEmailAndPassword(
      email,
      password
    );
    return result;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

// For testing, you can use custom initialization
import { AuthModule } from "@modules/auth";
import { MockUserRepository } from "../test/mocks";

// Initialize with test dependencies
const testAuth = AuthModule.initialize(new MockUserRepository());
```
