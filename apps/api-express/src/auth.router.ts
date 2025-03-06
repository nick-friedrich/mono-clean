import { AuthModuleConfig, AuthServiceError, UserLoginWithEmailAndPasswordInputSchema, UserSignUpWithEmailAndPasswordInputSchema } from "@shared/module";
import { Router } from "express";
import { ZodError } from "zod";
import { AuthModule } from "@shared/module";
import { JwtTokenService } from "node_modules/@shared/module/auth/service/token.jwt.service";
import { SessionDrizzleRepository, UserDrizzleRepository } from "@shared/repository";

export const authRouter: Router = Router();


// Setup auth module, user repository, session repository, and token service
const authConfig: AuthModuleConfig = {
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

authRouter.post('/login', async (req, res) => {
  try {
    const body = req.body;
    const input = UserLoginWithEmailAndPasswordInputSchema.parse(body);

    const authModule = AuthModule.getInstance(authConfig);
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
});

authRouter.post('/signup', async (req, res) => {
  try {
    const body = req.body;
    const input = UserSignUpWithEmailAndPasswordInputSchema.parse(body);

    const authModule = AuthModule.getInstance(authConfig, userRepository, tokenService);
    const result = await authModule.authService.signUpWithEmailAndPassword(input.email, input.password, input.name);

    res.json({ message: 'Signup successful', result });
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
  }
});