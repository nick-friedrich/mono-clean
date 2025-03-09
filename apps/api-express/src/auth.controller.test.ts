import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthModule, AuthModuleConfig, AuthServiceError, JwtTokenService } from '@shared/module';
import { SessionMockRepository } from '@shared/repository';
import { UserMockRepository } from '@shared/repository';

const authConfig: AuthModuleConfig = {
  jwt: {
    secret: 'secret',
    expiresIn: '1h',
  },
};
const authModule = AuthModule.getInstance(
  authConfig,
  new UserMockRepository(),
  new SessionMockRepository(),
  new JwtTokenService(authConfig.jwt)
);


// Ensure we use the actual Zod implementation.
vi.unmock('zod');

describe('AuthController', () => {
  let controller: AuthController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonSpy: ReturnType<typeof vi.fn>;
  let statusSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();

    // Create a new controller instance.
    controller = new AuthController(authModule);

    // Override authModule.authService methods with spies instead of direct assignment
    vi.spyOn(authModule.authService, 'signInWithEmailAndPassword').mockImplementation(vi.fn());
    vi.spyOn(authModule.authService, 'signUpWithEmailAndPassword').mockImplementation(vi.fn());
    vi.spyOn(authModule.authService, 'signOut').mockImplementation(vi.fn());

    // Mock the token service methods
    vi.spyOn(authModule.tokenService, 'verifyToken').mockImplementation(vi.fn());

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

      // Set up the auth service spy for a successful login.
      (authModule.authService.signInWithEmailAndPassword as any).mockResolvedValueOnce(dummyResult);

      await controller.signInWithEmailAndPassword(req as Request, res as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ message: 'Login successful', result: dummyResult });
    });

    it('should return 400 with AuthServiceError if login fails', async () => {
      req.body = { email: 'test@test.com', password: 'wrong-password' };

      // Create an error and force its prototype to match AuthServiceError.
      const error = new AuthServiceError('Invalid credentials');
      Object.setPrototypeOf(error, AuthServiceError.prototype);
      (authModule.authService.signInWithEmailAndPassword as any).mockRejectedValueOnce(error);

      await controller.signInWithEmailAndPassword(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'AuthServiceError: Failed to login',
        error: 'Invalid credentials'
      });
    });

    it('should return 400 with validation errors if input is invalid', async () => {
      req.body = { email: 'invalid-email', password: 12345 };

      // The mocked parse in the module should throw a ZodError.
      await controller.signInWithEmailAndPassword(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Validation error',
        errors: expect.any(Object)
      });
    });

    it('should return 500 for unexpected errors', async () => {
      req.body = { email: 'test@test.com', password: 'password' };

      (authModule.authService.signInWithEmailAndPassword as any).mockRejectedValueOnce(new Error('Unexpected database error'));

      await controller.signInWithEmailAndPassword(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: expect.any(Error)
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
        refreshToken: 'refresh-token-new'
      };

      (authModule.authService.signUpWithEmailAndPassword as any).mockResolvedValueOnce(dummyResult);

      await controller.signUpWithEmailAndPassword(req as Request, res as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ message: 'Signup successful', result: dummyResult });
    });

    it('should return 400 with AuthServiceError if signup fails', async () => {
      req.body = { email: 'newuser@test.com', password: 'password', name: 'NewUser' };

      const error = new AuthServiceError('User already exists');
      Object.setPrototypeOf(error, AuthServiceError.prototype);
      (authModule.authService.signUpWithEmailAndPassword as any).mockRejectedValueOnce(error);

      await controller.signUpWithEmailAndPassword(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'AuthServiceError: Failed to signup',
        error: 'User already exists'
      });
    });

    it('should return 400 with validation errors if input is invalid', async () => {
      req.body = { email: 'invalid-email', password: 12345, name: 67890 };

      await controller.signUpWithEmailAndPassword(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Validation error',
        errors: expect.any(Object)
      });
    });

    it('should return 500 for unexpected errors', async () => {
      req.body = { email: 'newuser@test.com', password: 'password', name: 'NewUser' };

      (authModule.authService.signUpWithEmailAndPassword as any).mockRejectedValueOnce(new Error('Unexpected database error'));

      await controller.signUpWithEmailAndPassword(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: expect.any(Error)
      });
    });
  });

  describe('signOut', () => {
    it('should return 200 with message on successful signout', async () => {
      req.body = { refreshToken: 'refresh-token' };

      (authModule.tokenService.verifyToken as any).mockResolvedValueOnce({ sessionId: 'sess-123' });
      (authModule.authService.signOut as any).mockResolvedValueOnce({ message: 'Signout successful' });

      await controller.signOut(req as Request, res as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ message: 'Signout successful', result: { message: 'Signout successful' } });
    });

    it('should return 400 with validation errors if input is invalid', async () => {
      // Set refreshToken to undefined to trigger the validation error
      req.body = { refreshToken: undefined };

      await controller.signOut(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Refresh token is required'
      });
    });

    it('should return 500 for unexpected errors', async () => {
      req.body = { refreshToken: 'refresh-token' };

      // Mock verifyToken to throw an error
      (authModule.tokenService.verifyToken as any).mockRejectedValueOnce(new Error('Token verification failed'));

      await controller.signOut(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: expect.any(Error)
      });
    });
  });

  describe('getMe', () => {
    it('should return 200 with user on successful getMe', async () => {
      req.user = { id: '1', email: 'test@test.com' };

      await controller.getMe(req as Request, res as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ message: 'Me', user: { id: '1', email: 'test@test.com' } });
    });
  });
});
