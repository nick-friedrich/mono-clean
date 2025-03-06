import { db } from "@shared/db-drizzle-pg";
import { usersTable } from "@shared/db-drizzle-pg/src/schema/users";
import { eq } from "drizzle-orm";
import { UserRepository } from "../interface";
import { User, UserSafe, UserSignUpWithEmailAndPasswordInput, UserUpdateInput } from "../types";

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
    };
  }

  /**
   * Create a user
   * @param user - The user to create
   * @returns The created user
   */
  async create(user: UserSignUpWithEmailAndPasswordInput): Promise<UserSafe> {
    const newUser = await db.insert(usersTable).values({
      name: user.name,
      email: user.email,
      password: user.password,
    }).returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
    })

    return {
      id: newUser[0].id,
      name: newUser[0].name,
      email: newUser[0].email,
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
    })

    return {
      id: updatedUser[0].id,
      name: updatedUser[0].name,
      email: updatedUser[0].email,
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