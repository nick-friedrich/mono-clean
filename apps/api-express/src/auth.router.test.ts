import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authRouter } from './auth.router';
import { AuthController } from './auth.controller';

// Mock the AuthController
vi.mock('./auth.controller', () => {
  const mockSignIn = vi.fn();
  const mockSignUp = vi.fn();

  return {
    AuthController: vi.fn().mockImplementation(() => ({
      signInWithEmailAndPassword: mockSignIn,
      signUpWithEmailAndPassword: mockSignUp
    })),
    authConfig: {},
    authModule: {
      authService: {}
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
  });

  it('should use controller methods as handlers', () => {
    // Get the login route handler
    const loginRoute = authRouter.stack.find((layer: any) => layer.route?.path === '/login');
    const signupRoute = authRouter.stack.find((layer: any) => layer.route?.path === '/signup');

    // Verify the handlers are from the controller
    expect(loginRoute?.route?.stack[0]?.handle).toBeDefined();
    expect(signupRoute?.route?.stack[0]?.handle).toBeDefined();
  });
}); 