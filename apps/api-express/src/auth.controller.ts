import { Request, Response } from 'express';
import { AuthModuleConfig, AuthServiceError, UserLoginWithEmailAndPasswordInputSchema, UserSignUpWithEmailAndPasswordInputSchema } from "@shared/module";
import { ZodError } from "zod";
import { AuthModule } from "@shared/module";
import { JwtTokenService } from "@shared/module";
import { SessionDrizzleRepository, UserDrizzleRepository } from "@shared/repository";

// Setup auth module, user repository, session repository, and token service
export const authConfig: AuthModuleConfig = {
  jwt: {
    secret: 'secret',
    expiresIn: '1h',
    refreshSecret: 'refreshSecret',
    refreshExpiresIn: '1d',
  },
};
const userRepository = new UserDrizzleRepository();
const sessionRepository = new SessionDrizzleRepository();
const tokenService = new JwtTokenService(authConfig.jwt, sessionRepository);
export const authModule = AuthModule.getInstance(authConfig, userRepository, tokenService);

export class AuthController {

  /**
   * Sign in with email and password
   * @param req 
   * @param res 
   * @returns 
   */
  async signInWithEmailAndPassword(req: Request, res: Response) {
    try {
      const body = req.body;
      const input = UserLoginWithEmailAndPasswordInputSchema.parse(body);

      const result = await authModule.authService.signInWithEmailAndPassword(input.email, input.password);

      res.json({ message: 'Login successful', result });
      // Optionally, you can add a return; here if you want to exit early.
      return;
    } catch (error) {
      if (error instanceof AuthServiceError) {
        res.status(400).json({
          message: "AuthServiceError: Failed to login",
          error: error.message,
        });
        return;
      }
      if (error instanceof ZodError) {
        res.status(400).json({
          message: 'Validation error',
          errors: error.errors,
        });
        return;
      }
      res.status(500).json({ message: 'Internal server error', error });
      return;
    }

  }

  /**
   * Sign up with email and password
   * @param req 
   * @param res 
   * @returns 
   */
  async signUpWithEmailAndPassword(req: Request, res: Response) {
    try {
      const body = req.body;
      const input = UserSignUpWithEmailAndPasswordInputSchema.parse(body);

      const result = await authModule.authService.signUpWithEmailAndPassword(input.email, input.password, input.name);

      res.json({ message: 'Signup successful', result });
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: 'Validation error',
          errors: error.errors,
        });
        return;
      }
      if (error instanceof AuthServiceError) {
        res.status(400).json({
          message: "AuthServiceError: Failed to signup",
          error: error.message,
        });
        return;
      }
      res.status(500).json({ message: 'Internal server error', error });
      return;
    }

  }


}