import { z } from "zod";
import { User, UserSafe, UserUpdateInput } from "@shared/repository";

// Re-export types from repository
export type { User, UserSafe, UserUpdateInput };

/**
 * User login with email and password input schema
 */
export const UserLoginWithEmailAndPasswordInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * Type of the user login with email and password input
 */
export type UserLoginWithEmailAndPasswordInput = z.infer<typeof UserLoginWithEmailAndPasswordInputSchema>;

/**
 * User sign up with email and password input schema
 */
export const UserSignUpWithEmailAndPasswordInputSchema = UserLoginWithEmailAndPasswordInputSchema.extend({
  name: z.string().min(1),
});

/**
 * Type of the user sign up with email and password input
 */
export type UserSignUpWithEmailAndPasswordInput = z.infer<typeof UserSignUpWithEmailAndPasswordInputSchema>;


