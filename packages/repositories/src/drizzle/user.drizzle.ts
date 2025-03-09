import { db } from "@shared/db-drizzle-pg";
import { usersTable } from "@shared/db-drizzle-pg/src/schema/users";
import { eq } from "drizzle-orm";
import { UserError, UserRepository } from "../interface";
import { User, UserRole, UserSafe, UserUpdateInput } from "../types";

/**
 * User repository implementation for Drizzle PostgreSQL
 */
export class UserDrizzleRepository extends UserRepository {
  /**
   * Find a user by id
   * @param id - The id of the user
   * @returns The user or null if not found
   */
  async findById(id: string): Promise<User | null> {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
    })

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password || undefined,
      userRole: user.userRole as UserRole,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      deletedAt: user.deleted_at || undefined,
    };
  }

  /**
   * Find a user by email
   * @param email - The email of the user
   * @returns The user or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    })

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password || undefined,
      userRole: user.userRole as UserRole,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      deletedAt: user.deleted_at || undefined,
    };
  }

  /**
   * Create a user
   * @param user - The user to create
   * @returns The created user
   */
  async create(user: User): Promise<UserSafe> {
    const newUser = await db.insert(usersTable).values({
      name: user.name,
      email: user.email,
      password: user.password,
    }).returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      userRole: usersTable.userRole,
      created_at: usersTable.created_at,
      updated_at: usersTable.updated_at,
    })

    if (!newUser[0]) {
      throw new UserError('Failed to create user');
    }

    return {
      id: newUser[0].id,
      name: newUser[0].name,
      email: newUser[0].email,
      createdAt: newUser[0].created_at,
      updatedAt: newUser[0].updated_at,
      deletedAt: undefined,
      userRole: newUser[0].userRole as UserRole,
    };
  }

  /**
   * Update a user
   * @param user - The user to update
   * @returns The updated user
   */
  async update(user: UserUpdateInput): Promise<UserSafe> {
    const updatedUser = await db.update(usersTable).set({
      name: user.name,
      email: user.email,
    }).where(eq(usersTable.id, user.id)).returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      userRole: usersTable.userRole,
      created_at: usersTable.created_at,
      updated_at: usersTable.updated_at,
    })

    if (!updatedUser[0]) {
      throw new UserError('Failed to update user');
    }

    return {
      id: updatedUser[0].id,
      name: updatedUser[0].name,
      email: updatedUser[0].email,
      createdAt: updatedUser[0].created_at,
      updatedAt: updatedUser[0].updated_at,
      deletedAt: undefined,
      userRole: updatedUser[0].userRole as UserRole,
    };
  }

  /**
   * Delete a user
   * @param id - The id of the user to delete
   */
  async delete(id: string): Promise<void> {
    await db.delete(usersTable).where(eq(usersTable.id, id));
  }
}