import { z } from 'zod';

/**
 * User with all data
 */
export const UserSchema = z
  .object({
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
export const UserSignUpWithEmailAndPasswordInputSchema = UserSchema
  .extend({
    password: z.string().min(8),
  })
  .omit({ id: true });

/**
 * Type of the user sign up with email and password
 */
export type UserSignUpWithEmailAndPasswordInput = z.infer<typeof UserSignUpWithEmailAndPasswordInputSchema>;

/**
 * User update input
 */
export const UserUpdateInputSchema = UserSchema.partial().extend({
  id: z.string(),
})

/**
 * Type of the user update input
 */
export type UserUpdateInput = z.infer<typeof UserUpdateInputSchema>;

