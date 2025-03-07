import { Router } from "express";
import { AuthController } from "./auth.controller";

export const authRouter: Router = Router();

const authController = new AuthController();

authRouter.post('/login', authController.signInWithEmailAndPassword);

authRouter.post('/signup', authController.signUpWithEmailAndPassword);