import { Request, Response, NextFunction } from 'express';
import { AuthModule } from '@shared/module';

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

  constructor(authModule: AuthModule) {
    this.authModule = authModule;
  }

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

  // async requireRole(role: string) {
  //   return (req: Request, res: Response, next: NextFunction) => {
  //     if (!req.user || req.user.role !== role) {
  //       return res.status(403).json({ message: 'Forbidden' });
  //     }
  //     next();
  //   };
  // }
}
