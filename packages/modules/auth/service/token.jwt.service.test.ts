import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JwtTokenService } from './token.jwt.service';

describe('JwtTokenService', () => {
  let service: JwtTokenService;

  beforeEach(() => {
    service = new JwtTokenService({
      secret: 'test-secret',
      expiresIn: '1h',
      refreshSecret: 'test-refresh-secret',
      refreshExpiresIn: '7d',
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a token', async () => {
    const tokenResult = await service.generateToken({ userId: '123' });
    expect(tokenResult).toBeDefined();
    expect(tokenResult.token).toBeDefined();
    expect(tokenResult.expiresAt).toBeGreaterThan(Date.now());

    // Verify the token payload using the secret
    const decoded = jwt.verify(tokenResult.token, 'test-secret') as jwt.JwtPayload;
    expect(decoded).toHaveProperty('userId', '123');
    expect(decoded).toHaveProperty('exp');
  });

  it('should verify a valid token', async () => {
    const tokenResult = await service.generateToken({ userId: '123' });
    const payload = await service.verifyToken(tokenResult.token);
    expect(payload).toBeDefined();
    expect(payload?.userId).toBe('123');
  });

  it('should return null when verifying an invalid token', async () => {
    const payload = await service.verifyToken('invalid-token');
    expect(payload).toBeNull();
  });

  it('should generate a refresh token along with an access token', async () => {
    const tokenResult = await service.generateRefreshToken({ userId: '123' });
    expect(tokenResult).toBeDefined();
    expect(tokenResult.token).toBeDefined();
    expect(tokenResult.refreshToken).toBeDefined();

    // Verify refresh token payload using refresh secret
    const decoded = jwt.verify(tokenResult.refreshToken, 'test-refresh-secret') as jwt.JwtPayload;
    expect(decoded).toHaveProperty('userId', '123');
    expect(decoded).toHaveProperty('type', 'refresh');
  });

  it('should refresh an access token given a valid refresh token', async () => {
    const tokenResult = await service.generateRefreshToken({ userId: '123' });
    const newTokenResult = await service.refreshToken(tokenResult.refreshToken);
    expect(newTokenResult).toBeDefined();
    expect(newTokenResult.token).toBeDefined();

    // Verify that the new token is signed with the access token secret
    const decoded = jwt.verify(newTokenResult.token, 'test-secret') as jwt.JwtPayload;
    expect(decoded).toHaveProperty('userId', '123');
  });

  it('should throw an error if refresh token is invalid', async () => {
    await expect(service.refreshToken('invalid-refresh-token')).rejects.toThrow('Invalid refresh token');
  });

  it('should throw an error if the provided refresh token is not of type refresh', async () => {
    // Create a token with type 'access' using the refresh secret
    const token = jwt.sign(
      { userId: '123', type: 'access' },
      'test-refresh-secret',
      { expiresIn: '7d' }
    );
    await expect(service.refreshToken(token)).rejects.toThrow('Invalid refresh token');
  });

  it('should correctly parse expiration strings', () => {
    // Access the private method via bracket notation
    // @ts-ignore: Testing private method
    expect(service['parseExpirationString']('30s')).toBe(30);
    // @ts-ignore
    expect(service['parseExpirationString']('10m')).toBe(600);
    // @ts-ignore
    expect(service['parseExpirationString']('2h')).toBe(7200);
    // @ts-ignore
    expect(service['parseExpirationString']('1d')).toBe(86400);
    // For unsupported units, the function defaults to 3600 seconds (1 hour)
    // @ts-ignore
    expect(service['parseExpirationString']('5x')).toBe(3600);
  });

  it('should generate a token using numeric expiresIn', async () => {
    // Create a new instance with numeric expiration values
    const numericService = new JwtTokenService({
      secret: 'num-secret',
      expiresIn: 1800, // 30 minutes in seconds
      refreshSecret: 'num-refresh-secret',
      refreshExpiresIn: 604800, // 7 days in seconds
    });
    const tokenResult = await numericService.generateToken({ userId: '456' });
    expect(tokenResult).toBeDefined();
    expect(tokenResult.token).toBeDefined();

    // Verify that token is signed with the correct secret
    const decoded = jwt.verify(tokenResult.token, 'num-secret') as jwt.JwtPayload;
    expect(decoded).toHaveProperty('userId', '456');

    // Validate that the expiration is approximately 30 minutes from now
    const expectedExp = Math.floor(Date.now() / 1000) + 1800;
    // Allow a small delta due to execution time
    expect(decoded.exp).toBeGreaterThanOrEqual(expectedExp - 5);
    expect(decoded.exp).toBeLessThanOrEqual(expectedExp + 5);
  });

  it('should generate a refresh token with numeric refreshExpiresIn', async () => {
    // Create a new instance with numeric refreshExpiresIn
    const numericRefreshService = new JwtTokenService({
      secret: 'test-secret',
      expiresIn: '1h',
      refreshSecret: 'test-refresh-secret',
      refreshExpiresIn: 3600, // 1 hour in seconds
    });
    const tokenResult = await numericRefreshService.generateRefreshToken({ userId: '789' });
    expect(tokenResult).toBeDefined();
    expect(tokenResult.refreshToken).toBeDefined();

    const decoded = jwt.verify(tokenResult.refreshToken, 'test-refresh-secret') as jwt.JwtPayload;
    expect(decoded).toHaveProperty('userId', '789');
    expect(decoded).toHaveProperty('type', 'refresh');

    // Validate that the refresh token expiration is approximately 1 hour from now
    const expectedExp = Math.floor(Date.now() / 1000) + 3600;
    expect(decoded.exp).toBeGreaterThanOrEqual(expectedExp - 5);
    expect(decoded.exp).toBeLessThanOrEqual(expectedExp + 5);
  });

  it('should return default expiration for an invalid expiration string', () => {
    // Using a string that does not start with a number (e.g., "x")
    // should trigger the isNaN branch and return the default 3600.
    // @ts-ignore: Testing private method
    expect(service['parseExpirationString']('x')).toBe(3600);
  });

  it('should create a session record when sessionRepository is provided', async () => {
    // Create a fake session repository with a mocked create method.
    const sessionRepo = {
      create: vi.fn().mockResolvedValue({
        id: 'sess-123',
        userId: '123',
        refreshToken: 'fake-refresh-token',
        userAgent: 'agent-test',
        ipAddress: '127.0.0.1',
        expiresAt: new Date(Date.now() + 3600 * 1000),
        isValid: true,
        lastUsedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    };

    // Create a new instance of the service with the session repository injected.
    const serviceWithSession = new JwtTokenService({
      secret: 'test-secret',
      expiresIn: '1h',
      refreshSecret: 'test-refresh-secret',
      refreshExpiresIn: '7d',
    }, sessionRepo as any);

    // Include additional data in the payload to simulate user agent & ip address.
    const payload = { userId: '123', userAgent: 'agent-test', ipAddress: '127.0.0.1' };
    const tokenResult = await serviceWithSession.generateRefreshToken(payload);

    // Verify that the session repository's create method was called with a session object.
    expect(sessionRepo.create).toHaveBeenCalled();
    const sessionData = sessionRepo.create.mock.calls[0][0];
    expect(sessionData.userId).toBe('123');
    expect(sessionData.refreshToken).toBe(tokenResult.refreshToken);
    expect(sessionData.userAgent).toBe('agent-test');
    expect(sessionData.ipAddress).toBe('127.0.0.1');

    // Also, verify the refresh token payload.
    const decoded = jwt.verify(tokenResult.refreshToken, 'test-refresh-secret') as jwt.JwtPayload;
    expect(decoded).toHaveProperty('userId', '123');
    expect(decoded).toHaveProperty('type', 'refresh');
  });
});
