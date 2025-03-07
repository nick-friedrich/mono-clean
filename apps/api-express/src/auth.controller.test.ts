import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { authConfig, AuthController, authModule } from './auth.controller';
import { AuthServiceError, UserLoginWithEmailAndPasswordInputSchema, UserSignUpWithEmailAndPasswordInputSchema } from '@shared/module';
import { AuthModule } from '@shared/module';
import { ZodError } from 'zod';

// Create a simpler approach - directly mock the schema parse methods
vi.mock('@shared/module', async () => {
  const actual = await vi.importActual('@shared/module');
  return {
    ...actual,
    UserLoginWithEmailAndPasswordInputSchema: {
      parse: vi.fn().mockImplementation((data) => {
        if (data.email === 'invalid-email' || typeof data.password !== 'string') {
          throw new Error('Validation failed');
        }
        return data;
      })
    },
    UserSignUpWithEmailAndPasswordInputSchema: {
      parse: vi.fn().mockImplementation((data) => {
        if (data.email === 'invalid-email' || typeof data.password !== 'string' || typeof data.name !== 'string') {
          throw new Error('Validation failed');
        }
        return data;
      })
    }
  };
});

// We'll use our controller instance and stub req/res objects.
describe('AuthController', () => {
  let controller: AuthController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonSpy: ReturnType<typeof vi.fn>;
  let statusSpy: ReturnType<typeof vi.fn>;

  // Before each test, create fresh controller and stubbed req/res.
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Create a new controller instance
    controller = new AuthController();

    // Use the actual exported singleton instance
    vi.spyOn(authModule.authService, 'signInWithEmailAndPassword').mockImplementation(async () => ({
      token: '',
      user: { id: 'test-id', email: 'test@example.com' },
      expiresAt: Date.now(),
      refreshToken: ''
    }));
    vi.spyOn(authModule.authService, 'signUpWithEmailAndPassword').mockImplementation(async () => ({
      token: '',
      user: { id: 'test-id', email: 'test@example.com' },
      expiresAt: Date.now(),
      refreshToken: ''
    }));

    req = {};
    jsonSpy = vi.fn();
    statusSpy = vi.fn().mockReturnValue({ json: jsonSpy });
    res = {
      json: jsonSpy,
      status: statusSpy,
    };
  });

  describe('signInWithEmailAndPassword', () => {
    it('should return 200 with token on successful login', async () => {
      const dummyResult = {
        token: 'mock-jwt-token',
        user: { id: '1', email: 'test@test.com' },
        expiresAt: Date.now(),
        refreshToken: 'refresh-token'
      };
      req.body = { email: 'test@test.com', password: 'password' };

      // Use the exported authModule directly
      vi.spyOn(authModule.authService, 'signInWithEmailAndPassword').mockResolvedValueOnce(dummyResult);

      await controller.signInWithEmailAndPassword(req as Request, res as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ message: 'Login successful', result: dummyResult });
    });

    it('should return 400 with AuthServiceError if login fails', async () => {
      req.body = { email: 'test@test.com', password: 'wrong-password' };

      // Use the exported authModule directly
      vi.spyOn(authModule.authService, 'signInWithEmailAndPassword')
        .mockRejectedValueOnce(new AuthServiceError('Invalid credentials'));

      await controller.signInWithEmailAndPassword(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'AuthServiceError: Failed to login',
        error: 'Invalid credentials',
      });
    });

    it('should return 400 with validation errors if input is invalid', async () => {
      req.body = { email: 'invalid-email', password: 12345 };

      await controller.signInWithEmailAndPassword(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Validation error',
        errors: expect.any(Object),
      });
    });

    it('should return 500 for unexpected errors', async () => {
      req.body = { email: 'test@test.com', password: 'password' };

      // Use the exported authModule directly
      vi.spyOn(authModule.authService, 'signInWithEmailAndPassword')
        .mockRejectedValueOnce(new Error('Unexpected database error'));

      await controller.signInWithEmailAndPassword(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: expect.any(Error),
      });
    });
  });

  describe('signUpWithEmailAndPassword', () => {
    it('should return success when signup is successful', async () => {
      req.body = { email: 'newuser@test.com', password: 'password', name: 'NewUser' };

      const dummyResult = {
        user: { id: '2', email: 'newuser@test.com', name: 'NewUser' },
        token: 'access-token-new',
        expiresAt: Date.now() + 10000,
        refreshToken: 'refresh-token-new',
      };

      // Use the exported authModule directly
      vi.spyOn(authModule.authService, 'signUpWithEmailAndPassword')
        .mockResolvedValueOnce(dummyResult);

      await controller.signUpWithEmailAndPassword(req as Request, res as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ message: 'Signup successful', result: dummyResult });
    });

    it('should return 400 with AuthServiceError if signup fails', async () => {
      req.body = { email: 'newuser@test.com', password: 'password', name: 'NewUser' };

      // Use the exported authModule directly
      vi.spyOn(authModule.authService, 'signUpWithEmailAndPassword')
        .mockRejectedValueOnce(new AuthServiceError('User already exists'));

      await controller.signUpWithEmailAndPassword(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'AuthServiceError: Failed to signup',
        error: 'User already exists',
      });
    });

    it('should return 400 with validation errors if input is invalid', async () => {
      req.body = { email: 'invalid-email', password: 12345, name: 67890 };

      await controller.signUpWithEmailAndPassword(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Validation error',
        errors: expect.any(Object),
      });
    });

    it('should return 500 for unexpected errors', async () => {
      req.body = { email: 'newuser@test.com', password: 'password', name: 'NewUser' };

      // Use the exported authModule directly
      vi.spyOn(authModule.authService, 'signUpWithEmailAndPassword')
        .mockRejectedValueOnce(new Error('Unexpected database error'));

      await controller.signUpWithEmailAndPassword(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: expect.any(Error),
      });
    });
  });
});
