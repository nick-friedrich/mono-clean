import { AuthMiddleware } from "./auth.middleware";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { AuthModule, AuthModuleConfig, JwtTokenService } from "@shared/module";
import { UserMockRepository, SessionMockRepository } from "@shared/repository";

const authConfig: AuthModuleConfig = {
  jwt: {
    secret: 'secret',
    expiresIn: '1h',
  },
};

describe('AuthMiddleware', () => {
  let authModule: AuthModule;

  beforeEach(() => {
    vi.clearAllMocks();
    authModule = AuthModule.getInstance(
      authConfig,
      new UserMockRepository(),
      new SessionMockRepository(),
      new JwtTokenService(authConfig.jwt)
    );
  });

  it('should be defined', () => {
    const authMiddleware = new AuthMiddleware(authModule);
    expect(authMiddleware).toBeDefined();
  });

  describe('verifyToken', () => {
    it('should return 401 if no token is provided', async () => {
      const authMiddleware = new AuthMiddleware(authModule);
      const req = { headers: {} };
      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnThis();
      const res = {
        status: statusMock,
        json: jsonMock
      };
      await authMiddleware.verifyToken(req as Request, res as unknown as Response, vi.fn());
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return 401 if token is invalid', async () => {
      const authMiddleware = new AuthMiddleware(authModule);
      const req = { headers: { authorization: 'Bearer invalid-token' } };
      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnThis();
      const res = {
        status: statusMock,
        json: jsonMock
      };
      await authMiddleware.verifyToken(req as Request, res as unknown as Response, vi.fn());
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    });

    it('should return 401 if token is invalid', async () => {
      const authMiddleware = new AuthMiddleware(authModule);
      const req = { headers: { authorization: 'Bearer  ' } };
      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnThis();
      const res = {
        status: statusMock,
        json: jsonMock
      };
      await authMiddleware.verifyToken(req as Request, res as unknown as Response, vi.fn());
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should call next if token is valid', async () => {
      // Mock the verifyToken method to return a valid payload
      vi.spyOn(authModule.tokenService, 'verifyToken').mockResolvedValueOnce({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user'
      });

      const authMiddleware = new AuthMiddleware(authModule);
      const req = {
        headers: { authorization: 'Bearer valid-token' },
        user: undefined // Add user property to be populated
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await authMiddleware.verifyToken(req as unknown as Request, res as unknown as Response, next);

      // Verify token was validated
      expect(authModule.tokenService.verifyToken).toHaveBeenCalledWith('valid-token');

      // Verify user was set on request
      expect(req.user).toBeDefined();
      expect(req.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        role: 'user'
      });

      // Verify next was called
      expect(next).toHaveBeenCalled();

      // Verify no error response was sent
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 401 if an error is caught', async () => {
      // Mock the verifyToken method to throw an error
      vi.spyOn(authModule.tokenService, 'verifyToken').mockImplementationOnce(() => {
        throw new Error('Token verification failed');
      });

      const authMiddleware = new AuthMiddleware(authModule);
      const req = {
        headers: { authorization: 'Bearer some-token' },
        user: undefined
      };
      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnThis();
      const res = {
        status: statusMock,
        json: jsonMock
      };
      const next = vi.fn();

      await authMiddleware.verifyToken(req as unknown as Request, res as unknown as Response, next);

      // Verify error response was sent
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });

      // Verify next was not called
      expect(next).not.toHaveBeenCalled();

      // Verify user was not set on request
      expect(req.user).toBeUndefined();
    });
  });
});
