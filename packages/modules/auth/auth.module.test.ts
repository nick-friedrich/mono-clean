import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthModule, AuthModuleConfig } from './auth.module';
import { AuthService } from './service/auth.service';
import { JwtTokenService } from './service/token.jwt.service';
import { SessionRepository, UserDrizzleRepository, UserRepository } from '@shared/repository';
import { TokenService } from './service/token.interface';

describe('AuthModule', () => {
  const config: AuthModuleConfig = {
    jwt: {
      secret: 'test-secret',
      expiresIn: '1h',
      refreshSecret: 'test-refresh-secret',
      refreshExpiresIn: '7d',
    },
  };

  // Reset the singleton instance before each test to ensure isolation.
  beforeEach(() => {
    // Using bracket notation to bypass private access
    // @ts-ignore
    AuthModule.instance = null;
  });

  it('should create a new instance using getInstance when none exists', () => {
    const instance = AuthModule.getInstance(config);
    expect(instance).toBeDefined();
    expect(instance.authService).toBeInstanceOf(AuthService);
    expect(instance.tokenService).toBeInstanceOf(JwtTokenService);
  });

  it('should return the same instance on multiple getInstance calls', () => {
    const instance1 = AuthModule.getInstance(config);
    const instance2 = AuthModule.getInstance({
      ...config,
      jwt: { secret: 'different-secret', expiresIn: '1h', refreshSecret: 'test-refresh-secret', refreshExpiresIn: '7d' }
    });
    expect(instance1).toBe(instance2);
  });

  it('should initialize a new instance with custom dependencies using initialize', () => {
    const customUserRepository: UserRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const customSessionRepository: SessionRepository = {
      findById: vi.fn(),
      findByRefreshToken: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteAllByUserId: vi.fn(),
      deleteAllExpiredSessions: vi.fn(),
    };

    const customTokenService: TokenService = {
      generateToken: vi.fn(),
      verifyToken: vi.fn(),
      refreshToken: vi.fn(),
      generateRefreshToken: vi.fn(),
    };

    const instance = AuthModule.initialize(config, customUserRepository, customSessionRepository, customTokenService);
    expect(instance).toBeDefined();
    expect(instance.authService).toBeInstanceOf(AuthService);
    expect(instance.tokenService).toBe(customTokenService);
  });

  it('should use default token service if custom token service is not provided', () => {
    const customUserRepository: UserRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const customSessionRepository: SessionRepository = {
      findById: vi.fn(),
      findByRefreshToken: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteAllByUserId: vi.fn(),
      deleteAllExpiredSessions: vi.fn(),
    };

    const instance = AuthModule.initialize(config, customUserRepository, customSessionRepository);
    expect(instance.tokenService).toBeInstanceOf(JwtTokenService);
  });
});
