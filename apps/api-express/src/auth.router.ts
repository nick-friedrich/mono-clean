import { Router } from "express";
import { AuthController } from "./auth.controller";
import { JwtTokenService } from "@shared/module";
import { AuthModule } from "@shared/module";
import { AuthModuleConfig } from "@shared/module";
import { SessionDrizzleRepository } from "@shared/repository";
import { UserDrizzleRepository } from "@shared/repository";
import { AuthMiddleware } from "./auth.middleware";

export const authRouter: Router = Router();


// Setup auth module, user repository, session repository, and token service
export const authConfig: AuthModuleConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refreshSecret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '1d',
  },
};
const userRepository = new UserDrizzleRepository();
const sessionRepository = new SessionDrizzleRepository();
const tokenService = new JwtTokenService(authConfig.jwt, sessionRepository);
export const authModule = AuthModule.getInstance(authConfig, userRepository, sessionRepository, tokenService);
const authController = new AuthController(authModule);
export const authMiddleware = new AuthMiddleware(authModule);


authRouter.post('/login', authController.signInWithEmailAndPassword.bind(authController));
authRouter.post('/signup', authController.signUpWithEmailAndPassword.bind(authController));
authRouter.post('/logout', authController.signOut.bind(authController));

// Protected routes
authRouter.get('/me',
  authMiddleware.verifyToken.bind(authMiddleware),
  authController.getMe.bind(authController)
);