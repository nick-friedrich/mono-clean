// src/__tests__/user.repository.factory.test.ts
import { describe, it, expect } from 'vitest';
import { getSessionRepository, sessionRepository } from './session.factory';
import { SessionDrizzleRepository } from '../drizzle/session.drizzle';
import { SessionMockRepository } from '../mock/session.mock';

describe('getSessionRepository', () => {
  it('should return an instance of SessionDrizzleRepository when passed "drizzle"', () => {
    const repo = getSessionRepository('drizzle');
    expect(repo).toBeInstanceOf(SessionDrizzleRepository);
  });

  it('should return an instance of SessionMockRepository when passed "mock"', () => {
    const repo = getSessionRepository('mock');
    expect(repo).toBeInstanceOf(SessionMockRepository);
  });

  it('should default to drizzle when no implementation is provided', () => {
    const repo = getSessionRepository();
    expect(repo).toBeInstanceOf(SessionDrizzleRepository);
  });

  it('should throw an error for unknown implementation', () => {
    expect(() => getSessionRepository('unknown' as any)).toThrowError(
      'Unknown implementation: unknown'
    );
  });
});

describe('sessionRepository export', () => {
  it('should be an instance of SessionDrizzleRepository by default', () => {
    expect(sessionRepository).toBeInstanceOf(SessionDrizzleRepository);
  });
});
