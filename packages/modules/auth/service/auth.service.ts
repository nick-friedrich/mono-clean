// packages/modules/auth/service/auth.service.ts
import { UserRepository } from "@shared/repository";
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

export class AuthService {
  /**
   * Constructor
   * @param userRepository - User repository
   * @param tokenService - Token service
   */
  constructor(
    private userRepository: UserRepository,
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
        email: user.email
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

  async signUpWithEmailAndPassword(email: string, password: string, name?: string): Promise<SignInResult> {
    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await PasswordService.hash(password);

    // Create user
    const newUser = await this.userRepository.create({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0]
    });

    // Sign in the new user (reuse logic)
    return this.signInWithEmailAndPassword(email, password);
  }

  async validateToken(token: string): Promise<{ userId: string } | null> {
    return this.tokenService.verifyToken(token);
  }

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

  async signOut() {
    // With JWT, there's no server-side logout required
    // You would invalidate tokens in a real-world scenario with a token blacklist
    return { success: true };
  }
}

export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message);
  }
}

