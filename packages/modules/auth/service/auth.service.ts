// packages/modules/auth/service/auth.service.ts
import { SessionRepository, User, UserRepository, UserRole, UserRoleHierarchy } from "@shared/repository";
import { TokenService, TokenPayload } from "./token.interface";
import { PasswordService } from "./password.service";

export interface SignInResult {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  token: string;
  expiresAt: number;
  refreshToken?: string;
}

/**
 * Auth service
 */
export class AuthService {
  /**
   * Constructor
   * @param userRepository - User repository
   * @param tokenService - Token service
   */
  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository,
    private tokenService: TokenService
  ) { }

  /**
   * Sign in with email and password
   * @param email - User email
   * @param password - User password
   * @returns Sign in result
   */
  async signInWithEmailAndPassword(email: string, password: string): Promise<SignInResult> {
    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthServiceError("Invalid email or password");
    }

    if (!user.password) {
      throw new AuthServiceError("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await PasswordService.verify(password, user.password);
    if (!isPasswordValid) {
      throw new AuthServiceError("Invalid email or password");
    }

    // Generate tokens
    let tokenResult;

    // Check if the token service supports refresh tokens
    if ('generateRefreshToken' in this.tokenService &&
      typeof this.tokenService.generateRefreshToken === 'function') {
      const refreshResult = await this.tokenService.generateRefreshToken({
        userId: user.id,
        email: user.email,
        userRole: user.userRole,
        // Add any additional claims you need
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token: refreshResult.token,
        expiresAt: refreshResult.expiresAt,
        refreshToken: refreshResult.refreshToken
      };
    } else {
      // Simple token generation without refresh
      tokenResult = await this.tokenService.generateToken({
        userId: user.id,
        email: user.email,
        userRole: user.userRole,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token: tokenResult.token,
        expiresAt: tokenResult.expiresAt
      };
    }
  }

  /**
   * Sign up with email and password
   * @param email - User email
   * @param password - User password
   * @param name - User name
   * @returns Sign up result, which is the same as the sign in result
   */
  async signUpWithEmailAndPassword(email: string, password: string, name?: string): Promise<SignInResult> {
    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AuthServiceError("User already exists");
    }

    // Hash password
    const hashedPassword = await PasswordService.hash(password);

    if (!name) {
      name = email.split('@')[0];
      if (!name) {
        throw new AuthServiceError("Invalid name");
      }
    }

    // Create user
    const newUser = await this.userRepository.create({
      email,
      password: hashedPassword,
      name: name,
      userRole: 'user'
    });

    // Sign in the new user (reuse logic)
    return this.signInWithEmailAndPassword(email, password);
  }

  /**
   * Validate token
   * @param token - Token
   * @returns Token result
   */
  async validateToken(token: string): Promise<{ userId: string } | null> {
    return this.tokenService.verifyToken(token);
  }

  /**
   * Refresh token
   * @param refreshToken - Refresh token
   * @returns Refresh token result
   */
  async refreshToken(refreshToken: string): Promise<Omit<SignInResult, 'user' | 'refreshToken'>> {
    if (!this.tokenService.refreshToken) {
      throw new Error('Refresh token functionality not supported');
    }

    const tokenResult = await this.tokenService.refreshToken(refreshToken);

    return {
      token: tokenResult.token,
      expiresAt: tokenResult.expiresAt
    };
  }

  /**
   * Sign out
   * @returns Sign out result
   */
  async signOut(sessionId: string) {
    // Delete session
    await this.sessionRepository.delete(sessionId)

    return { success: true };
  }

  /**
   * Checks if a user has sufficient role
   * @param user - User
   * @param requiredRole - Required role
   * @returns True if the user has the required role, false otherwise
   */
  hasRole(user: User, requiredRole: UserRole) {
    return UserRoleHierarchy[user.userRole] >= UserRoleHierarchy[requiredRole];
  }
}

export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message);
  }
}

