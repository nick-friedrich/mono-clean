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

/**
 * User repository
 * This is used for the implementation of the user repository for specific databases/orms
 * @abstract
 */
export abstract class AbstractUserRepository {
  /**
   * Find a user by id
   * @param id - The id of the user
   * @returns The user or null if not found
   */
  abstract findById(id: string): Promise<User | null>;

  /**
   * Find a user by email
   * @param email - The email of the user
   * @returns The user or null if not found
   */
  abstract findByEmail(email: string): Promise<User | null>;

  /**
   * Create a user
   * @param user - The user to create
   * @returns The created user
   */
  abstract create(user: User): Promise<User>;

  /**
   * Update a user
   * @param user - The user to update
   * @returns The updated user
   */
  abstract update(user: User): Promise<User>;

  /**
   * Delete a user
   * @param id - The id of the user to delete
   */
  abstract delete(id: string): Promise<void>;
}