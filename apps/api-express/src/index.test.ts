import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import { authRouter } from './auth.router';

// Mock express and its methods
vi.mock('express', () => {
  const mockRouter = {
    use: vi.fn().mockReturnThis(),
    get: vi.fn().mockReturnThis()
  };

  const mockApp = {
    use: vi.fn().mockReturnThis(),
    get: vi.fn().mockReturnThis(),
    listen: vi.fn().mockReturnThis()
  };

  return {
    default: vi.fn().mockReturnValue(mockApp),
    Router: vi.fn().mockReturnValue(mockRouter),
    json: vi.fn()
  };
});

// Mock morgan
vi.mock('morgan', () => ({
  default: vi.fn().mockReturnValue('morgan-middleware')
}));

// Mock auth router
vi.mock('./auth.router', () => ({
  authRouter: 'mock-auth-router'
}));

describe('Express App', () => {
  let app: any;
  let expressApp: any;
  let mockRouter: any;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Reset express mock implementation
    expressApp = {
      use: vi.fn().mockReturnThis(),
      get: vi.fn().mockReturnThis(),
      listen: vi.fn().mockReturnThis()
    };

    mockRouter = {
      use: vi.fn().mockReturnThis(),
      get: vi.fn().mockReturnThis()
    };

    (express as any).mockReturnValue(expressApp);
    (express.Router as any).mockReturnValue(mockRouter);

    // Import the app (this will execute the file)
    app = require('./index');
  });

  it('should configure middleware correctly', () => {
    // Check if express.json middleware is used
    expect(expressApp.use).toHaveBeenCalledWith(expect.any(Function));

    // Check if morgan middleware is used
    expect(expressApp.use).toHaveBeenCalledWith('morgan-middleware');
  });

  it('should set up routes correctly', () => {
    // Check if root route is configured
    expect(expressApp.get).toHaveBeenCalledWith('/', expect.any(Function));

    // Check if API routes are configured
    expect(expressApp.use).toHaveBeenCalledWith('/api', expect.any(Object));

    // Check if auth router is used
    expect(mockRouter.use).toHaveBeenCalledWith('/auth', 'mock-auth-router');
  });

  it('should start the server', () => {
    // Check if app.listen is called with port 3000
    expect(expressApp.listen).toHaveBeenCalledWith(3000, expect.any(Function));
  });
}); 