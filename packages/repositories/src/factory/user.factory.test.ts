import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock implementations
const drizzleRepoMock = vi.hoisted(() => ({ _type: 'drizzle' }));
const mockRepoMock = vi.hoisted(() => ({ _type: 'mock' }));

// Mock the UserDrizzleRepository constructor
const UserDrizzleRepositoryMock = vi.hoisted(() =>
  vi.fn().mockImplementation(() => drizzleRepoMock)
);

// Mock the UserMockRepository constructor
const UserMockRepositoryMock = vi.hoisted(() =>
  vi.fn().mockImplementation(() => mockRepoMock)
);

// Mock the modules before importing from them
vi.mock('../drizzle/user.drizzle', () => {
  return {
    UserDrizzleRepository: UserDrizzleRepositoryMock
  };
});

vi.mock('../mock/user.mock', () => {
  return {
    UserMockRepository: UserMockRepositoryMock
  };
});

// Import after mocking
import { getUserRepository, userRepository } from './user.factory';

describe('User Repository Factory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserRepository', () => {
    it('should return a DrizzleUserRepository by default', () => {
      const repo = getUserRepository();
      expect(UserDrizzleRepositoryMock).toHaveBeenCalled();
      expect(repo).toHaveProperty('_type', 'drizzle');
    });

    it('should return a DrizzleUserRepository when "drizzle" is specified', () => {
      const repo = getUserRepository('drizzle');
      expect(UserDrizzleRepositoryMock).toHaveBeenCalled();
      expect(repo).toHaveProperty('_type', 'drizzle');
    });

    it('should return a MockUserRepository when "mock" is specified', () => {
      const repo = getUserRepository('mock');
      expect(UserMockRepositoryMock).toHaveBeenCalled();
      expect(repo).toHaveProperty('_type', 'mock');
    });

    it('should throw an error for unknown implementation type', () => {
      // @ts-ignore - Testing invalid type
      expect(() => getUserRepository('invalid')).toThrow('Unknown implementation: invalid');
    });
  });

  describe('userRepository singleton', () => {
    it('should be an instance of a repository', () => {
      expect(userRepository).toBeDefined();
      // Since userRepository is created when the module loads, we can't verify that
      // the constructor was called. Instead, check that it has the right type.
      expect(userRepository).toHaveProperty('_type', 'drizzle');
    });
  });
});
