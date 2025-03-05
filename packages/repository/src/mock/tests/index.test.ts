import { describe, it, expect, beforeEach } from 'vitest';
import { UserMockRepository } from '../user.mock';
import { User } from '../../types';

describe('UserMockRepository', () => {
  let repository: UserMockRepository;

  // Sample test users
  const testUsers: User[] = [
    {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    },
    {
      id: '2',
      name: 'Another User',
      email: 'another@example.com',
      password: 'anotherpassword'
    }
  ];

  beforeEach(() => {
    // Create a fresh repository before each test
    repository = new UserMockRepository();
    // Reset to ensure it's empty
    repository.reset();
  });

  describe('reset and setUsers', () => {
    it('should start with an empty repository', () => {
      expect(repository.getAll()).toHaveLength(0);
    });

    it('should populate users with setUsers', () => {
      repository.setUsers(testUsers);
      expect(repository.getAll()).toHaveLength(2);
      expect(repository.getAll()[0].id).toBe('1');
    });

    it('should clear users with reset', () => {
      repository.setUsers(testUsers);
      expect(repository.getAll()).toHaveLength(2);

      repository.reset();
      expect(repository.getAll()).toHaveLength(0);
    });
  });

  describe('findById', () => {
    beforeEach(() => {
      repository.setUsers(testUsers);
    });

    it('should find a user by id', async () => {
      const user = await repository.findById('1');
      expect(user).not.toBeNull();
      expect(user?.name).toBe('Test User');
    });

    it('should return null for non-existent id', async () => {
      const user = await repository.findById('non-existent');
      expect(user).toBeNull();
    });
  });

  describe('findByEmail', () => {
    beforeEach(() => {
      repository.setUsers(testUsers);
    });

    it('should find a user by email', async () => {
      const user = await repository.findByEmail('test@example.com');
      expect(user).not.toBeNull();
      expect(user?.id).toBe('1');
    });

    it('should return null for non-existent email', async () => {
      const user = await repository.findByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user with generated id', async () => {
      const newUser = await repository.create({
        name: 'New User',
        email: 'new@example.com',
        password: 'newpassword'
      });

      expect(newUser.id).toBeDefined();
      expect(newUser.name).toBe('New User');

      // Verify it was added to the repository
      const allUsers = repository.getAll();
      expect(allUsers).toHaveLength(1);
      expect(allUsers[0].email).toBe('new@example.com');
    });

    it('should throw an error when creating a user with duplicate email', async () => {
      repository.setUsers(testUsers);

      await expect(repository.create({
        name: 'Duplicate Email',
        email: 'test@example.com', // Same as existing user
        password: 'password'
      })).rejects.toThrow('User with email test@example.com already exists');
    });
  });

  describe('update', () => {
    beforeEach(() => {
      repository.setUsers(testUsers);
    });

    it('should update an existing user', async () => {
      const updatedUser = await repository.update({
        id: '1',
        name: 'Updated Name',
        email: 'test@example.com',
        password: 'updatedpassword'
      });

      expect(updatedUser.name).toBe('Updated Name');

      // Verify the repository was updated
      const user = await repository.findById('1');
      expect(user?.name).toBe('Updated Name');
      expect(user?.password).toBe('updatedpassword');
    });

    it('should throw an error when updating non-existent user', async () => {
      await expect(repository.update({
        id: 'non-existent',
        name: 'Non-existent User',
        email: 'nonexistent@example.com',
        password: 'password'
      })).rejects.toThrow('User with id non-existent not found');
    });

    it('should throw an error when updating to a duplicate email', async () => {
      await expect(repository.update({
        id: '1',
        name: 'Test User',
        email: 'another@example.com', // This email is already used by user 2
        password: 'password123'
      })).rejects.toThrow('User with email another@example.com already exists');
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      repository.setUsers(testUsers);
    });

    it('should delete an existing user', async () => {
      expect(repository.getAll()).toHaveLength(2);

      await repository.delete('1');

      expect(repository.getAll()).toHaveLength(1);
      expect(await repository.findById('1')).toBeNull();
    });

    it('should not throw an error when deleting non-existent user', async () => {
      expect(repository.getAll()).toHaveLength(2);

      await repository.delete('non-existent');

      // Should still have both original users
      expect(repository.getAll()).toHaveLength(2);
    });
  });
});
