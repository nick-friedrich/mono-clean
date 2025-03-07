// packages/modules/auth/auth.module.ts
import { SessionDrizzleRepository, SessionRepository, UserDrizzleRepository, UserRepository } from "@shared/repository";
import { AuthService } from "./service/auth.service";
import { TokenService } from "./service/token.interface";
import { JwtTokenService } from "./service/token.jwt.service";

/**
 * Auth module config
 */
export interface AuthModuleConfig {
  jwt: {
    secret: string;
    expiresIn: string | number;
    refreshSecret?: string;
    refreshExpiresIn?: string | number;
  }
}

/**
 * Auth module
 * @description This module is responsible for handling all authentication related logic.
 *
 * It provides a singleton instance of the AuthService and TokenService.
 *
 * @example
 * const authModule = AuthModule.getInstance({
 *   jwt: {
 *     secret: 'secret',
 *     expiresIn: '1h',
 *     refreshSecret: 'refreshSecret',
 *     refreshExpiresIn: '7d',
 *   },
 * });
 *
 * const authService = authModule.authService;
 * const tokenService = authModule.tokenService;
 *
 * const user = await authService.signInWithEmailAndPassword('test@test.com', 'password');
 * const token = await tokenService.generateToken({ userId: user.id });
 * 
 */
export class AuthModule {
  private static instance: AuthModule | null = null;

  readonly authService: AuthService;
  readonly tokenService: TokenService;

  private constructor(
    config: AuthModuleConfig,
    userRepository = new UserDrizzleRepository(),
    sessionRepository = new SessionDrizzleRepository(),
    tokenService?: TokenService
  ) {
    // Initialize token service
    this.tokenService = tokenService || new JwtTokenService(config.jwt);

    // Initialize auth service with token service
    this.authService = new AuthService(userRepository, sessionRepository, this.tokenService);
  }

  /**
   * Get the singleton instance of AuthModule
   */
  static getInstance(config: AuthModuleConfig, userRepository?: UserRepository, sessionRepository?: SessionRepository, tokenService?: TokenService): AuthModule {
    if (!AuthModule.instance) {
      AuthModule.instance = new AuthModule(config, userRepository, sessionRepository, tokenService);
    }
    return AuthModule.instance;
  }

  /**
   * Initialize with custom dependencies (useful for testing)
   */
  static initialize(
    config: AuthModuleConfig,
    userRepository: UserRepository,
    sessionRepository: SessionRepository,
    tokenService?: TokenService
  ): AuthModule {
    AuthModule.instance = new AuthModule(config, userRepository, sessionRepository, tokenService);
    return AuthModule.instance;
  }
}

