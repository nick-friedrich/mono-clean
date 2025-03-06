
// src/mock/user.repository.ts
import { UserRepository } from '../interface';
import { User, UserSafe } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class UserMockRepository extends UserRepository {
  private users: User[] = [];

  /**
   * Reset the repository to empty state
   */
  reset(): void {
    this.users = [];
  }

  /**
   * Pre-populate the repository with test data
   */
  setUsers(users: User[]): void {
    this.users = [...users];
  }

  /**
   * Get all users (helper method for testing)
   */
  getAll(): User[] {
    return [...this.users];
  }

  /**
   * Implementation of UserRepositoryInterface methods
   */
  async findById(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email);
    return user || null;
  }

  async create(userData: Omit<User, 'id'>): Promise<User> {
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new Error(`User with email ${userData.email} already exists`);
    }

    const newUser: User = {
      id: uuidv4(),
      ...userData
    };

    this.users.push(newUser);
    return { ...newUser };
  }

  async update(user: User): Promise<UserSafe> {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index === -1) {
      throw new Error(`User with id ${user.id} not found`);
    }

    // If email is being changed, check it doesn't conflict
    if (user.email && user.email !== this.users[index].email) {
      const existingUser = await this.findByEmail(user.email);
      if (existingUser) {
        throw new Error(`User with email ${user.email} already exists`);
      }
    }

    // Update the user
    this.users[index] = {
      ...this.users[index],
      ...user
    };

    return { ...this.users[index] };
  }

  async delete(id: string): Promise<void> {
    const initialLength = this.users.length;
    this.users = this.users.filter(u => u.id !== id);
  }
}