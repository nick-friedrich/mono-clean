import { z } from 'zod';

/**
 * User role
 */
export const UserRoleSchema = z.enum([
  'admin',
  'user',
  'guest',
  'banned',
  'moderator',
]);

/**
 * Type of the user role
 */
export type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * User with all data
 */
export const UserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    password: z.string().optional(),
    userRole: UserRoleSchema.default('user'),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().optional(),
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
 * User create input
 */
export const UserCreateInputSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
})

/**
 * Type of the user create input
 */
export type UserCreateInput = z.infer<typeof UserCreateInputSchema>;

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

