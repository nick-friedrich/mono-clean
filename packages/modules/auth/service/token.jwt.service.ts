import jwt, { SignOptions } from 'jsonwebtoken';
import { TokenPayload, TokenResult, RefreshTokenResult, TokenService } from './token.interface';
import { Session, SessionCreateInput } from '@shared/repository';
import { SessionRepository } from '@shared/repository/interface';

/**
 * JWT config
 */
export interface JwtConfig {
  secret: string;
  expiresIn: string | number; // e.g., '1h', '7d', or seconds
  refreshSecret?: string; // Separate secret for refresh tokens
  refreshExpiresIn?: string | number; // e.g., '7d', '30d'
}

/**
 * JWT token service with optional session support.
 */
export class JwtTokenService implements TokenService {
  private config: JwtConfig;
  private sessionRepository?: SessionRepository;

  /**
   * Constructor
   * @param config - JWT config
   * @param sessionRepository - Optional session repository to persist refresh tokens
   */
  constructor(config: JwtConfig, sessionRepository?: SessionRepository) {
    this.config = {
      ...config,
      // Default refresh token settings if not provided
      refreshSecret: config.refreshSecret || `${config.secret}_refresh`,
      refreshExpiresIn: config.refreshExpiresIn || '7d'
    };
    this.sessionRepository = sessionRepository;
  }

  /**
   * Generate token
   * @param payload - Token payload
   * @returns Token result
   */
  async generateToken(payload: TokenPayload): Promise<TokenResult> {
    const expirationSeconds =
      typeof this.config.expiresIn === 'string'
        ? this.parseExpirationString(this.config.expiresIn)
        : this.config.expiresIn;

    const expiresAt = Math.floor(Date.now() / 1000) + expirationSeconds;

    const token = jwt.sign(
      { ...payload, exp: expiresAt },
      this.config.secret
    );

    return {
      token,
      expiresAt: expiresAt * 1000 // Convert to milliseconds
    };
  }

  /**
   * Verify token
   * @param token - Token
   * @returns Token payload or null if invalid
   */
  async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      const payload = jwt.verify(token, this.config.secret) as TokenPayload;
      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate refresh token and store a session record (if sessionRepository is provided)
   * @param payload - Token payload
   * @returns Refresh token result
   */
  async generateRefreshToken(payload: TokenPayload): Promise<RefreshTokenResult> {
    // Generate access token
    const tokenResult = await this.generateToken(payload);

    const refreshExpiresIn =
      typeof this.config.refreshExpiresIn === 'string'
        ? this.parseExpirationString(this.config.refreshExpiresIn)
        : this.config.refreshExpiresIn;

    const signOptions: SignOptions = {
      expiresIn: refreshExpiresIn
    };

    const refreshToken = jwt.sign(
      { userId: payload.userId, type: 'refresh' },
      this.config.refreshSecret as string,
      signOptions
    );

    // If a session repository is provided, create a session record
    if (this.sessionRepository) {
      const sessionData: SessionCreateInput = {
        // If your repository generates the id, you can leave it empty or generate one with uuid
        userId: payload.userId,
        refreshToken,
        userAgent: (payload as any).userAgent || 'unknown',
        ipAddress: (payload as any).ipAddress || 'unknown',
        expiresAt: new Date(Date.now() + (refreshExpiresIn ?? 1000 * 60 * 60 * 24 * 7)),
        isValid: true,
        lastUsedAt: new Date(),
      };
      await this.sessionRepository.create(sessionData);
    }

    return {
      ...tokenResult,
      refreshToken
    };
  }

  /**
   * Refresh token: verifies the refresh token and returns a new access token.
   * @param refreshToken - Refresh token
   * @returns Token result
   */
  async refreshToken(refreshToken: string): Promise<TokenResult> {
    try {
      // Verify refresh token
      const payload = jwt.verify(
        refreshToken,
        this.config.refreshSecret as string
      ) as TokenPayload & { type: string };

      // Ensure it's a refresh token
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Optionally, update session (e.g., lastUsedAt) if using sessionRepository
      if (this.sessionRepository) {
        const session = await this.sessionRepository.findByRefreshToken(refreshToken);
        if (session) {
          await this.sessionRepository.update({
            id: session.id,
            lastUsedAt: new Date(),
            expiresAt: new Date(Date.now() + (this.config.refreshExpiresIn as number) * 1000),
          });
        }
      }

      // Generate a new access token
      return this.generateToken({
        userId: payload.userId
      });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Parse expiration string
   * @param expiration - Expiration string
   * @returns Expiration in seconds
   */
  private parseExpirationString(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1), 10);
    if (isNaN(value)) {
      // Return default if parsing fails
      return 3600; // Default to 1 hour
    }
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 3600;
    }
  }
}
