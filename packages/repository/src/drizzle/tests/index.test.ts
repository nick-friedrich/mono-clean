import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserDrizzleRepository } from '../user.drizzle';
import { User, UserSignUpWithEmailAndPasswordInput, UserUpdateInput } from '../../types/user.types';

// Use vi.hoisted to define mock variables before they're used in vi.mock
const mockUsers = [
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
  },
  {
    id: '3',
    name: 'User No Password',
    email: 'nopassword@example.com',
    password: null
  }
];

// Define values and set mocks for chaining operations
const valuesMock = vi.hoisted(() => vi.fn().mockReturnThis());
const setMock = vi.hoisted(() => vi.fn().mockReturnThis());
const whereMock = vi.hoisted(() => vi.fn().mockReturnThis());
const returningMock = vi.hoisted(() => vi.fn());

// Define mocks using vi.hoisted to prevent hoisting issues
const dbMock = vi.hoisted(() => ({
  query: {
    usersTable: {
      findFirst: vi.fn()
    }
  },
  insert: vi.fn().mockImplementation(() => ({
    values: valuesMock,
    returning: returningMock
  })),
  update: vi.fn().mockImplementation(() => ({
    set: setMock,
    where: whereMock,
    returning: returningMock
  })),
  delete: vi.fn().mockImplementation(() => ({
    where: whereMock
  }))
}));

// Mock the eq function with hoisting
const eqMock = vi.hoisted(() => vi.fn().mockImplementation(() => 'mocked-eq-condition'));

// Setup module mocks
vi.mock('@shared/db-drizzle-pg', () => {
  return {
    db: dbMock
  };
});

vi.mock('drizzle-orm', () => {
  return {
    eq: eqMock
  };
});

vi.mock('@shared/db-drizzle-pg/src/schema/users', () => {
  return {
    usersTable: {
      id: 'id',
      name: 'name',
      email: 'email',
      password: 'password'
    }
  };
});

describe('UserDrizzleRepository', () => {
  let repository: UserDrizzleRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new UserDrizzleRepository();
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      // Setup mock to return a user
      dbMock.query.usersTable.findFirst.mockResolvedValueOnce(mockUsers[0]);

      const user = await repository.findById('1');

      expect(eqMock).toHaveBeenCalledWith(expect.anything(), '1');
      expect(dbMock.query.usersTable.findFirst).toHaveBeenCalledWith({
        where: 'mocked-eq-condition'
      });
      expect(user).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should find a user with null password and set it to undefined', async () => {
      // Setup mock to return a user with null password to test the || undefined branch
      dbMock.query.usersTable.findFirst.mockResolvedValueOnce(mockUsers[2]);

      const user = await repository.findById('3');

      expect(user).toEqual({
        id: '3',
        name: 'User No Password',
        email: 'nopassword@example.com',
        password: undefined
      });
    });

    it('should return null when user is not found', async () => {
      // Setup mock to return null
      dbMock.query.usersTable.findFirst.mockResolvedValueOnce(null);

      const user = await repository.findById('999');

      expect(eqMock).toHaveBeenCalledWith(expect.anything(), '999');
      expect(dbMock.query.usersTable.findFirst).toHaveBeenCalledWith({
        where: 'mocked-eq-condition'
      });
      expect(user).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      // Setup mock to return a user
      dbMock.query.usersTable.findFirst.mockResolvedValueOnce(mockUsers[0]);

      const user = await repository.findByEmail('test@example.com');

      expect(eqMock).toHaveBeenCalledWith(expect.anything(), 'test@example.com');
      expect(dbMock.query.usersTable.findFirst).toHaveBeenCalledWith({
        where: 'mocked-eq-condition'
      });
      expect(user).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should find a user with null password and set it to undefined', async () => {
      // Setup mock to return a user with null password to test the || undefined branch
      dbMock.query.usersTable.findFirst.mockResolvedValueOnce(mockUsers[2]);

      const user = await repository.findByEmail('nopassword@example.com');

      expect(user).toEqual({
        id: '3',
        name: 'User No Password',
        email: 'nopassword@example.com',
        password: undefined
      });
    });

    it('should return null when email is not found', async () => {
      // Setup mock to return null
      dbMock.query.usersTable.findFirst.mockResolvedValueOnce(null);

      const user = await repository.findByEmail('nonexistent@example.com');

      expect(eqMock).toHaveBeenCalledWith(expect.anything(), 'nonexistent@example.com');
      expect(dbMock.query.usersTable.findFirst).toHaveBeenCalledWith({
        where: 'mocked-eq-condition'
      });
      expect(user).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a user and return the user data without password', async () => {
      // Setup mock to return created user
      returningMock.mockResolvedValueOnce([{
        id: '3',
        name: 'New User',
        email: 'new@example.com'
      }]);

      const newUser: User = {
        id: '3',
        name: 'New User',
        email: 'new@example.com',
        password: 'newpassword'
      };

      const result = await repository.create(newUser as UserSignUpWithEmailAndPasswordInput);

      expect(dbMock.insert).toHaveBeenCalled();

      // Check that expected properties are in the values call
      // Note: The actual implementation doesn't include id in the values call
      const firstCallArg = valuesMock.mock.calls[0][0];
      expect(firstCallArg).toBeDefined();
      expect(firstCallArg.name).toBe('New User');
      expect(firstCallArg.email).toBe('new@example.com');
      expect(firstCallArg.password).toBe('newpassword');

      expect(result).toEqual({
        id: '3',
        name: 'New User',
        email: 'new@example.com'
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should handle undefined password when creating a user', async () => {
      // Setup mock to return created user
      returningMock.mockResolvedValueOnce([{
        id: '3',
        name: 'New User',
        email: 'new@example.com'
      }]);

      const newUser: User = {
        id: '3',
        name: 'New User',
        email: 'new@example.com',
        // No password property to test the undefined branch
      };

      const result = await repository.create(newUser as UserSignUpWithEmailAndPasswordInput);

      expect(dbMock.insert).toHaveBeenCalled();

      // Check that expected properties are in the values call
      // Note: The actual implementation doesn't include id in the values call
      const firstCallArg = valuesMock.mock.calls[0][0];
      expect(firstCallArg).toBeDefined();
      expect(firstCallArg.name).toBe('New User');
      expect(firstCallArg.email).toBe('new@example.com');
      expect(firstCallArg.password).toBeUndefined();

      expect(result).toEqual({
        id: '3',
        name: 'New User',
        email: 'new@example.com'
      });
    });
  });

  describe('update', () => {
    it('should update a user and return the user data without password', async () => {
      // Setup mock to return updated user
      returningMock.mockResolvedValueOnce([{
        id: '1',
        name: 'Updated User',
        email: 'test@example.com'
      }]);

      const userToUpdate: User = {
        id: '1',
        name: 'Updated User',
        email: 'test@example.com',
        password: 'updatedpassword'
      };

      const result = await repository.update(userToUpdate as UserUpdateInput);

      expect(dbMock.update).toHaveBeenCalled();

      // Check that expected properties are in the set call
      // Note: According to the implementation, password is not included in the update
      const firstCallArg = setMock.mock.calls[0][0];
      expect(firstCallArg).toBeDefined();
      expect(firstCallArg.name).toBe('Updated User');
      expect(firstCallArg.email).toBe('test@example.com');
      // Password is not set in the actual implementation
      expect(firstCallArg.password).toBeUndefined();

      expect(whereMock).toHaveBeenCalledWith('mocked-eq-condition');
      expect(eqMock).toHaveBeenCalledWith(expect.anything(), '1');

      expect(result).toEqual({
        id: '1',
        name: 'Updated User',
        email: 'test@example.com'
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should handle undefined password when updating a user', async () => {
      // Setup mock to return updated user
      returningMock.mockResolvedValueOnce([{
        id: '1',
        name: 'Updated User',
        email: 'test@example.com'
      }]);

      const userToUpdate: User = {
        id: '1',
        name: 'Updated User',
        email: 'test@example.com',
        // No password property to test the undefined branch
      };

      const result = await repository.update(userToUpdate as UserUpdateInput);

      expect(dbMock.update).toHaveBeenCalled();

      // Check that expected properties are in the set call
      const firstCallArg = setMock.mock.calls[0][0];
      expect(firstCallArg).toBeDefined();
      expect(firstCallArg.name).toBe('Updated User');
      expect(firstCallArg.email).toBe('test@example.com');
      expect(firstCallArg.password).toBeUndefined();

      expect(result).toEqual({
        id: '1',
        name: 'Updated User',
        email: 'test@example.com'
      });
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      // Setup mock to return nothing
      whereMock.mockResolvedValueOnce(undefined);

      await repository.delete('1');

      expect(dbMock.delete).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith(expect.anything(), '1');
      expect(whereMock).toHaveBeenCalledWith('mocked-eq-condition');
    });
  });
});
