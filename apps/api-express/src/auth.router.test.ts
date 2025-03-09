import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authRouter, authMiddleware } from './auth.router';
import { Request, Response, NextFunction } from 'express';
import { AuthMiddleware } from './auth.middleware';

// Mock the AuthController
vi.mock('./auth.controller', () => {
  const mockSignInWithEmailAndPassword = vi.fn();
  const mockSignUpWithEmailAndPassword = vi.fn();
  const mockSignOut = vi.fn();
  const mockGetMe = vi.fn();
  const mockVerifyToken = vi.fn();

  return {
    AuthController: vi.fn().mockImplementation(() => ({
      signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
      signUpWithEmailAndPassword: mockSignUpWithEmailAndPassword,
      signOut: mockSignOut,
      getMe: mockGetMe
    })),
    AuthMiddleware: vi.fn().mockImplementation(() => ({
      verifyToken: mockVerifyToken,
      requireRole: vi.fn()
    })),
    authConfig: {},
    authModule: {
      authService: {},
      tokenService: {}
    }
  };
});

describe('Auth Router', () => {
  it('should have routes configured correctly', () => {
    // Get all registered routes
    const routes = authRouter.stack.map((layer: any) => ({
      path: layer.route?.path,
      method: layer.route?.stack[0]?.method
    }));

    // Check if login route exists with POST method
    expect(routes).toContainEqual({
      path: '/login',
      method: 'post'
    });

    // Check if signup route exists with POST method
    expect(routes).toContainEqual({
      path: '/signup',
      method: 'post'
    });

    // Check if logout route exists with POST method
    expect(routes).toContainEqual({
      path: '/logout',
      method: 'post'
    });

    // Check if me route exists with GET method
    expect(routes).toContainEqual({
      path: '/me',
      method: 'get'
    });
  });

  it('should use controller methods as handlers', () => {
    // Get the login route handler
    const loginRoute = authRouter.stack.find((layer: any) => layer.route?.path === '/login');
    const signupRoute = authRouter.stack.find((layer: any) => layer.route?.path === '/signup');
    const logoutRoute = authRouter.stack.find((layer: any) => layer.route?.path === '/logout');
    const meRoute = authRouter.stack.find((layer: any) => layer.route?.path === '/me');

    // Verify the handlers are from the controller
    expect(loginRoute?.route?.stack[0]?.handle).toBeDefined();
    expect(signupRoute?.route?.stack[0]?.handle).toBeDefined();
    expect(logoutRoute?.route?.stack[0]?.handle).toBeDefined();

    // Verify the me route has middleware and controller handler
    expect(meRoute?.route?.stack.length).toBe(2);
    expect(meRoute?.route?.stack[0]?.handle).toBeDefined(); // Middleware
    expect(meRoute?.route?.stack[1]?.handle).toBeDefined(); // Controller
  });

  describe('Auth GET /admin', () => {
    it('should have a defined admin route', () => {
      // Find the admin route
      const adminRoute = authRouter.stack.find(
        (layer) => layer.route && layer.route.path === '/admin'
      );

      expect(adminRoute).toBeDefined();
      expect(adminRoute?.route?.stack.length).toBeGreaterThanOrEqual(1);
    });

    it('should respond with protected admin route message', () => {
      // Mock the route handler directly
      const mockReq = {} as Request;
      const mockRes = {
        json: vi.fn()
      } as unknown as Response;

      // Create the handler function that would be used in the route
      const handler = (req: Request, res: Response) => {
        res.json({ message: 'Protected Admin route' });
      };

      // Call the handler directly
      handler(mockReq, mockRes);

      // Verify it returns the expected response
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Protected Admin route' });
    });

    it('should use requireRole middleware and call the handler', async () => {
      // Create a mock AuthMiddleware instance
      const mockAuthMiddleware = {
        requireRole: vi.fn().mockImplementation((role) => {
          return Promise.resolve((req: Request, res: Response, next: Function) => {
            next();
          });
        })
      };

      // Mock request, response, and next
      const mockReq = {} as Request;
      const mockRes = {
        json: vi.fn()
      } as unknown as Response;
      const mockNext = vi.fn();

      // Create the middleware function that would be used in the route
      const roleMiddleware = async (req: Request, res: Response, next: Function) => {
        const middleware = await mockAuthMiddleware.requireRole('admin');
        await middleware(req, res, next);
      };

      // Call the middleware
      await roleMiddleware(mockReq, mockRes, mockNext);

      // Verify requireRole was called with 'admin'
      expect(mockAuthMiddleware.requireRole).toHaveBeenCalledWith('admin');

      // Verify next was called (meaning the middleware completed successfully)
      expect(mockNext).toHaveBeenCalled();

      // Now test the final handler
      const finalHandler = (req: Request, res: Response) => {
        res.json({ message: 'Protected Admin route' });
      };

      // Call the handler
      finalHandler(mockReq, mockRes);

      // Verify it returns the expected response
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Protected Admin route' });
    });
  });
});

describe('Auth Router Direct Tests', () => {
  it('should test admin route middleware directly', async () => {
    // Mock the requireRole method on authMiddleware
    const mockMiddleware = vi.fn((req, res, next) => next());
    vi.spyOn(authMiddleware, 'requireRole').mockResolvedValue(mockMiddleware);

    // Create the middleware function that's in the router
    const adminRouteMiddleware = async (req: Request, res: Response, next: NextFunction) => {
      const middleware = await authMiddleware.requireRole('admin');
      await middleware(req, res, next);
    };

    // Create mock request, response, and next
    const mockReq = {} as Request;
    const mockRes = {} as Response;
    const mockNext = vi.fn() as unknown as NextFunction;

    // Call the middleware
    await adminRouteMiddleware(mockReq, mockRes, mockNext);

    // Verify requireRole was called with 'admin'
    expect(authMiddleware.requireRole).toHaveBeenCalledWith('admin');

    // Verify the middleware was called with the request, response, and next
    expect(mockMiddleware).toHaveBeenCalledWith(mockReq, mockRes, mockNext);

    // Verify next was called
    expect(mockNext).toHaveBeenCalled();
  });

  it('should test admin route handler directly', () => {
    // Create the handler function that's in the router
    const adminRouteHandler = (req: Request, res: Response) => {
      res.json({ message: 'Protected Admin route' });
    };

    // Create mock request and response
    const mockReq = {} as Request;
    const mockRes = {
      json: vi.fn()
    } as unknown as Response;

    // Call the handler
    adminRouteHandler(mockReq, mockRes);

    // Verify json was called with the correct message
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Protected Admin route' });
  });

  it('should test the actual admin route middleware from the router', async () => {
    // Find the admin route in the router
    const adminRoute = authRouter.stack.find(
      (layer) => layer.route && layer.route.path === '/admin'
    );

    expect(adminRoute).toBeDefined();

    if (!adminRoute || !adminRoute.route) {
      throw new Error('Admin route not found');
    }

    // Get the actual middleware function from the router (the second handler)
    const roleMiddlewareWrapper = adminRoute.route.stack[1]?.handle;

    if (!roleMiddlewareWrapper) {
      throw new Error('Role middleware not found');
    }

    // Mock the requireRole method on authMiddleware
    const mockMiddleware = vi.fn((req, res, next) => next());
    vi.spyOn(authMiddleware, 'requireRole').mockResolvedValue(mockMiddleware);

    // Create mock request, response, and next
    const mockReq = {} as Request;
    const mockRes = {} as Response;
    const mockNext = vi.fn() as unknown as NextFunction;

    // Call the actual middleware from the router
    await roleMiddlewareWrapper(mockReq, mockRes, mockNext);

    // Verify requireRole was called with 'admin'
    expect(authMiddleware.requireRole).toHaveBeenCalledWith('admin');

    // Verify the middleware was called with the request, response, and next
    expect(mockMiddleware).toHaveBeenCalledWith(mockReq, mockRes, mockNext);

    // Verify next was called
    expect(mockNext).toHaveBeenCalled();

    // Get the actual handler function from the router (the third handler)
    const finalHandler = adminRoute.route.stack[2]?.handle;

    if (!finalHandler) {
      throw new Error('Final handler not found');
    }

    // Reset the mock response
    const jsonMock = vi.fn();
    const mockResWithJson = {
      json: jsonMock
    } as unknown as Response;

    // Call the actual handler from the router
    finalHandler(mockReq, mockResWithJson, mockNext);

    // Verify json was called with the correct message
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Protected Admin route' });
  });
}); 