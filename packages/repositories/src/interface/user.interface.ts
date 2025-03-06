import { User, UserCreateInput, UserSafe, UserUpdateInput } from '../types';

/**
 * User repository
 * This is used for the implementation of the user repository for specific databases/orms
 * @abstract
 */
export abstract class UserRepository {
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
  abstract create(user: UserCreateInput): Promise<UserSafe>;

  /**
   * Update a user
   * @param user - The user to update
   * @returns The updated user
   */
  abstract update(user: UserUpdateInput): Promise<UserSafe>;

  /**
   * Delete a user
   * @param id - The id of the user to delete
   */
  abstract delete(id: string): Promise<void>;
}