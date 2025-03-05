import { AbstractUserRepository } from '../interface';
import { UserDrizzleRepository } from '../drizzle';
import { UserMockRepository } from '../mock';

type RepositoryImplementation = 'drizzle' | 'mock';

export function getUserRepository(implementation: RepositoryImplementation = 'drizzle'): AbstractUserRepository {
  switch (implementation) {
    case 'drizzle':
      return new UserDrizzleRepository();
    case 'mock':
      return new UserMockRepository();
    default:
      throw new Error(`Unknown implementation: ${implementation}`);
  }
}

export const userRepository = getUserRepository();