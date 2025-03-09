
/**
 * Token payload
 */
export interface TokenPayload {
  userId: string;
  email?: string;
  userRole?: string;
  [key: string]: any; // Allow for custom claims
}

/**
 * Token result
 */
export interface TokenResult {
  token: string;
  expiresAt: number; // Timestamp when token expires
}

/**
 * Refresh token result
 */
export interface RefreshTokenResult extends TokenResult {
  refreshToken: string;
}

/**
 * Token service
 */
export interface TokenService {
  generateToken(payload: TokenPayload): Promise<TokenResult>;
  verifyToken(token: string): Promise<TokenPayload | null>;

  // Optional: Add refresh token functionality
  generateRefreshToken?(payload: TokenPayload): Promise<RefreshTokenResult>;
  refreshToken?(refreshToken: string): Promise<TokenResult>;
}