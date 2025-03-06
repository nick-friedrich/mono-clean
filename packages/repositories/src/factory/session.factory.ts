import { SessionRepository } from '../interface/session.interface';
import { SessionDrizzleRepository } from '../drizzle/session.drizzle';
import { SessionMockRepository } from '../mock/session.mock';

type RepositoryImplementation = 'drizzle' | 'mock';

export function getSessionRepository(
  implementation: RepositoryImplementation = 'drizzle'
): SessionRepository {
  switch (implementation) {
    case 'drizzle':
      return new SessionDrizzleRepository();
    case 'mock':
      return new SessionMockRepository();
    default:
      throw new Error(`Unknown implementation: ${implementation}`);
  }
}

export const sessionRepository = getSessionRepository();
