import { z } from 'zod';

/**
 * User with all data
 */
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  password: z.string().optional(),
});
/**
 * Type of the user with all data
 */
export type User = z.infer<typeof UserSchema>;

/**
 * User without sensitive data
 */
export const UserSchemaSafe = UserSchema.omit({ password: true });

/**
 * Type of the user without sensitive data
 */
export type UserSafe = z.infer<typeof UserSchemaSafe>;

/**
 * User sign up with email and password
 */
export const UserSignUpWithEmailAndPasswordSchema = UserSchema.extend({
  password: z.string().min(8),
});

/**
 * Type of the user sign up with email and password
 */
export type UserSignUpWithEmailAndPassword = z.infer<typeof UserSignUpWithEmailAndPasswordSchema>;
