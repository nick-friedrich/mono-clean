import { Request, Response, NextFunction } from 'express';
import { AuthModule } from '@shared/module';
import { UserRole } from '@shared/repository';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      role?: string;
    };
  }
}

export class AuthMiddleware {
  private authModule: AuthModule;

  /**
   * Constructor
   * @param authModule - Auth module
   */
  constructor(authModule: AuthModule) {
    this.authModule = authModule;
  }

  /**
   * Verify token
   * @param req - Request
   * @param res - Response
   * @param next - Next function
   * @returns void
   */
  async verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    try {
      const payload = await this.authModule.tokenService.verifyToken(token);

      if (!payload) {
        res.status(401).json({ message: 'Invalid token' });
        return;
      }

      req.user = {
        id: payload.userId,
        email: payload.email || '',
        role: payload.role
      };

      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
  }

  /**
   * Require role
   * @param role - Role
   * @returns void
   */
  // TODO: TEST
  async requireRole(role: UserRole) {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const user = await this.authModule.userRepository.findById(req.user.id);
      if (!user || !this.authModule.authService.hasRole(user, role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    };
  }
}
