import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService, AuthServiceError, SignInResult } from './auth.service';
import { PasswordService } from './password.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: any;
  let tokenService: any;

  beforeEach(() => {
    // Create a stub for UserRepository
    userRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
    };

    // Create a stub for TokenService with all methods
    tokenService = {
      generateToken: vi.fn(),
      generateRefreshToken: vi.fn(),
      verifyToken: vi.fn(),
      refreshToken: vi.fn(),
    };

    authService = new AuthService(userRepository, tokenService);
  });

  describe('signInWithEmailAndPassword', () => {
    it('should throw error if user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      await expect(
        authService.signInWithEmailAndPassword('nonexistent@test.com', 'password')
      ).rejects.toThrow(AuthServiceError);
    });

    it('should throw error if user exists but has no password', async () => {
      userRepository.findByEmail.mockResolvedValue({ id: '1', email: 'test@test.com' });
      await expect(
        authService.signInWithEmailAndPassword('test@test.com', 'password')
      ).rejects.toThrow(AuthServiceError);
    });

    it('should throw error if password verification fails', async () => {
      userRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hashed-pass',
      });
      // Override PasswordService.verify to return false
      const verifySpy = vi.spyOn(PasswordService, 'verify').mockResolvedValue(false);
      await expect(
        authService.signInWithEmailAndPassword('test@test.com', 'wrongpass')
      ).rejects.toThrow(AuthServiceError);
      verifySpy.mockRestore();
    });

    it('should sign in using tokenService.generateRefreshToken if available', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        password: 'hashed-pass',
        name: 'Test User',
      };
      userRepository.findByEmail.mockResolvedValue(user);
      const verifySpy = vi.spyOn(PasswordService, 'verify').mockResolvedValue(true);

      // Ensure tokenService supports refresh tokens
      tokenService.generateRefreshToken = vi.fn().mockResolvedValue({
        token: 'access-token',
        expiresAt: Date.now() + 1000,
        refreshToken: 'refresh-token',
      });

      const result: SignInResult = await authService.signInWithEmailAndPassword(
        'test@test.com',
        'correctpass'
      );
      expect(tokenService.generateRefreshToken).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
      });
      expect(result).toEqual({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token: 'access-token',
        expiresAt: expect.any(Number),
        refreshToken: 'refresh-token',
      });
      verifySpy.mockRestore();
    });

    it('should sign in using tokenService.generateToken if refresh token not supported', async () => {
      const user = {
        id: '2',
        email: 'norefresh@test.com',
        password: 'hashed-pass',
        name: 'No Refresh',
      };
      userRepository.findByEmail.mockResolvedValue(user);
      const verifySpy = vi.spyOn(PasswordService, 'verify').mockResolvedValue(true);

      // Remove generateRefreshToken to force using generateToken
      delete tokenService.generateRefreshToken;
      tokenService.generateToken = vi.fn().mockResolvedValue({
        token: 'access-token-only',
        expiresAt: Date.now() + 2000,
      });

      const result: SignInResult = await authService.signInWithEmailAndPassword(
        'norefresh@test.com',
        'correctpass'
      );
      expect(tokenService.generateToken).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
      });
      expect(result).toEqual({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token: 'access-token-only',
        expiresAt: expect.any(Number),
      });
      verifySpy.mockRestore();
    });

    it('should compute name from email if name is not provided', async () => {
      // Simulate that no user exists yet.
      userRepository.findByEmail.mockResolvedValueOnce(null);
      // When creating the user, return an object with the computed name.
      userRepository.create.mockResolvedValue({
        id: 'new-user',
        email: 'testuser@test.com',
        password: 'hashed-pass',
        name: 'testuser'
      });
      // After creation, simulate that signIn returns the new user.
      userRepository.findByEmail.mockResolvedValue({
        id: 'new-user',
        email: 'testuser@test.com',
        password: 'hashed-pass',
        name: 'testuser',
      });
      // Stub password verification to succeed.
      const verifySpy = vi.spyOn(PasswordService, 'verify').mockResolvedValue(true);
      // Assume tokenService supports refresh tokens.
      tokenService.generateRefreshToken = vi.fn().mockResolvedValue({
        token: 'new-access-token',
        expiresAt: Date.now() + 3000,
        refreshToken: 'new-refresh-token',
      });

      const result = await authService.signUpWithEmailAndPassword(
        'testuser@test.com',
        'pass'
        // Note: no name is provided.
      );

      // Check that create was called with the computed name from email.split('@')[0]
      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'testuser@test.com',
        password: expect.stringContaining('argon2'), // assuming hash includes 'argon2'
        name: 'testuser',
      });
      expect(result.user.name).toBe('testuser');
      verifySpy.mockRestore();
    });

    it('should throw an error if computed name is empty', async () => {
      // Simulate that no user exists.
      userRepository.findByEmail.mockResolvedValueOnce(null);

      // Call with an email that has an empty prefix (e.g. "@test.com")
      await expect(
        authService.signUpWithEmailAndPassword('@test.com', 'pass')
      ).rejects.toThrow("Invalid name");
    });

  });

  describe('signUpWithEmailAndPassword', () => {
    it('should throw error if user already exists', async () => {
      userRepository.findByEmail.mockResolvedValue({ id: 'existing', email: 'existing@test.com' });
      await expect(
        authService.signUpWithEmailAndPassword('existing@test.com', 'pass')
      ).rejects.toThrow('User already exists');
    });

    it('should sign up a new user and sign in', async () => {
      // First check returns null (user does not exist)
      userRepository.findByEmail.mockResolvedValueOnce(null);
      // Create returns a new user object
      userRepository.create.mockResolvedValue({
        id: 'new-user',
        email: 'new@test.com',
        password: 'hashed-pass',
        name: 'new',
      });
      // After creation, signInWithEmailAndPassword is called; simulate that:
      userRepository.findByEmail.mockResolvedValue({
        id: 'new-user',
        email: 'new@test.com',
        password: 'hashed-pass',
        name: 'new',
      });
      const verifySpy = vi.spyOn(PasswordService, 'verify').mockResolvedValue(true);
      // Assume token service supports refresh tokens here
      tokenService.generateRefreshToken = vi.fn().mockResolvedValue({
        token: 'new-access-token',
        expiresAt: Date.now() + 3000,
        refreshToken: 'new-refresh-token',
      });

      const result: SignInResult = await authService.signUpWithEmailAndPassword(
        'new@test.com',
        'pass',
        'new'
      );
      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'new@test.com',
        password: expect.stringContaining('argon2'),
        name: 'new',
      });
      expect(result).toEqual({
        user: {
          id: 'new-user',
          email: 'new@test.com',
          name: 'new',
        },
        token: 'new-access-token',
        expiresAt: expect.any(Number),
        refreshToken: 'new-refresh-token',
      });
      verifySpy.mockRestore();
    });

    it('should sign up a new user and sign in', async () => {
      // First check returns null (user does not exist)
      userRepository.findByEmail.mockResolvedValueOnce(null);
      // Create returns a new user object
      userRepository.create.mockResolvedValue({
        id: 'new-user',
        email: 'new@test.com',
        password: 'hashed-pass',
        name: 'new',
      });
      // After creation, signInWithEmailAndPassword is called; simulate that:
      userRepository.findByEmail.mockResolvedValue({
        id: 'new-user',
        email: 'new@test.com',
        password: 'hashed-pass',
        name: 'new',
      });
      const verifySpy = vi.spyOn(PasswordService, 'verify').mockResolvedValue(true);
      // Assume token service supports refresh tokens here
      tokenService.generateRefreshToken = vi.fn().mockResolvedValue({
        token: 'new-access-token',
        expiresAt: Date.now() + 3000,
        refreshToken: 'new-refresh-token',
      });

      const result: SignInResult = await authService.signUpWithEmailAndPassword(
        'new@test.com',
        'pass',
      );

      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'new@test.com',
        password: expect.stringContaining('argon2'),
        name: 'new',
      });

      expect(result).toEqual({
        user: {
          id: 'new-user',
          email: 'new@test.com',
          name: 'new',
        },
        token: 'new-access-token',
        expiresAt: expect.any(Number),
        refreshToken: 'new-refresh-token',
      });
      verifySpy.mockRestore();
    });
  });

  describe('validateToken', () => {
    it('should validate a token using tokenService.verifyToken', async () => {
      tokenService.verifyToken.mockResolvedValue({ userId: 'valid-user' });
      const result = await authService.validateToken('some-token');
      expect(tokenService.verifyToken).toHaveBeenCalledWith('some-token');
      expect(result).toEqual({ userId: 'valid-user' });
    });
  });

  describe('refreshToken', () => {
    it('should throw error if refresh token functionality not supported', async () => {
      // Remove refreshToken from tokenService to simulate lack of support
      delete tokenService.refreshToken;
      await expect(authService.refreshToken('some-refresh-token')).rejects.toThrow(
        'Refresh token functionality not supported'
      );
    });

    it('should refresh token if supported', async () => {
      tokenService.refreshToken = vi.fn().mockResolvedValue({
        token: 'refreshed-access-token',
        expiresAt: Date.now() + 4000,
      });
      const result = await authService.refreshToken('some-refresh-token');
      expect(tokenService.refreshToken).toHaveBeenCalledWith('some-refresh-token');
      expect(result).toEqual({
        token: 'refreshed-access-token',
        expiresAt: expect.any(Number),
      });
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const result = await authService.signOut();
      expect(result).toEqual({ success: true });
    });
  });
});
