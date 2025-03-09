import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authRouter } from './auth.router';

// Mock the AuthController
vi.mock('./auth.controller', () => {
  const mockSignIn = vi.fn();
  const mockSignUp = vi.fn();
  const mockSignOut = vi.fn();
  const mockGetMe = vi.fn();

  return {
    AuthController: vi.fn().mockImplementation(() => ({
      signInWithEmailAndPassword: mockSignIn,
      signUpWithEmailAndPassword: mockSignUp,
      signOut: mockSignOut,
      getMe: mockGetMe
    })),
    authConfig: {},
    authModule: {
      authService: {},
      tokenService: {}
    }
  };
});

// Mock the AuthMiddleware
vi.mock('./auth.middleware', () => {
  const mockVerifyToken = vi.fn();

  return {
    AuthMiddleware: vi.fn().mockImplementation(() => ({
      verifyToken: mockVerifyToken
    }))
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

}); 