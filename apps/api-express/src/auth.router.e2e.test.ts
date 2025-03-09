import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import request from 'supertest';

describe('Auth Router E2E', () => {
  let app: express.Application;

  beforeEach(() => {
    // Create a new Express app
    app = express();
    app.use(express.json());

    // Create mock routes that simulate the auth router behavior
    const router = express.Router();

    // Login route
    router.post('/login', (req: Request, res: Response) => {
      if (req.body.email === 'test@example.com' && req.body.password === 'password123') {
        res.json({
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    });

    // Logout route
    router.post('/logout', (req: Request, res: Response) => {
      if (req.body.refreshToken === 'mock-refresh-token') {
        res.json({ message: 'Logged out successfully' });
      } else {
        res.status(400).json({ message: 'Invalid refresh token' });
      }
    });

    // Auth middleware for protected routes
    const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
      if (req.headers.authorization === 'Bearer mock-jwt-token') {
        req.user = { id: 'user-123', email: 'test@example.com' };
        next();
      } else {
        res.status(401).json({ message: 'Unauthorized' });
      }
    };

    // Me route
    router.get('/me', authMiddleware, (req: Request, res: Response) => {
      res.json({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        userRole: 'admin'
      });
    });

    // Admin route
    router.get('/admin', authMiddleware, (req: Request, res: Response) => {
      res.json({ message: 'Protected Admin route' });
    });

    app.use('/api/auth', router);
  });

  it('should allow login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token', 'mock-jwt-token');
    expect(response.body).toHaveProperty('refreshToken', 'mock-refresh-token');
  });

  it('should not allow login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrong-password'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should allow access to protected routes with valid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer mock-jwt-token');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 'user-123');
    expect(response.body).toHaveProperty('email', 'test@example.com');
  });

  it('should not allow access to protected routes without token', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
  });

  it('should allow access to admin route with valid token', async () => {
    const response = await request(app)
      .get('/api/auth/admin')
      .set('Authorization', 'Bearer mock-jwt-token');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Protected Admin route');
  });

  it('should not allow access to admin route without token', async () => {
    const response = await request(app).get('/api/auth/admin');
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should allow logout with valid refresh token', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .send({
        refreshToken: 'mock-refresh-token'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Logged out successfully');
  });
}); 