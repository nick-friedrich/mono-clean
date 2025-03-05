
import { AbstractUserRepository } from '../interface';
import { UserDrizzleRepository } from '../drizzle';

type RepositoryImplementation = 'drizzle' | 'mock';

export function getUserRepository(implementation: RepositoryImplementation = 'drizzle'): AbstractUserRepository {
  switch (implementation) {
    case 'drizzle':
      return new UserDrizzleRepository();
    case 'mock':
      throw new Error('Mock implementation not yet available');
    default:
      throw new Error(`Unknown implementation: ${implementation}`);
  }
}

export const userRepository = getUserRepository();