// packages/modules/auth/auth.module.ts
import { UserDrizzleRepository, UserRepository } from "@shared/repository";
import { AuthService } from "./service/auth.service";

export class AuthModule {
  private static instance: AuthModule | null = null;

  readonly authService: AuthService;

  private constructor(userRepository = new UserDrizzleRepository()) {
    this.authService = new AuthService(userRepository);
  }

  /**
   * Get the singleton instance of AuthModule
   */
  static getInstance(): AuthModule {
    if (!AuthModule.instance) {
      AuthModule.instance = new AuthModule();
    }
    return AuthModule.instance;
  }

  /**
   * Initialize with custom dependencies (useful for testing)
   */
  static initialize(userRepository: UserRepository): AuthModule {
    AuthModule.instance = new AuthModule(userRepository);
    return AuthModule.instance;
  }
}
// Export a default instance for easy imports
export const auth = AuthModule.getInstance();
