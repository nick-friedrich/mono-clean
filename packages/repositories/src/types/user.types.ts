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
 * User Role with numeric values representing hierarchy
 * Higher values indicate higher privileges
 */
export const UserRoleHierarchy = {
  banned: -1,
  guest: 0,
  user: 10,
  moderator: 20,
  admin: 30,
} as const;

/**
 * Type guard to ensure UserRoleHierarchy keys match UserRoleSchema values
 * This will cause a type error if the keys in UserRoleHierarchy don't match the values in UserRoleSchema
 */
type EnsureUserRoleMatch = {
  [K in UserRole]: typeof UserRoleHierarchy[K];
};

// This constant isn't used at runtime, but ensures type safety at compile time
const _userRoleTypeCheck: EnsureUserRoleMatch = UserRoleHierarchy;


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


