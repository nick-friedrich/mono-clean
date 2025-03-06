// src/mock/session.repository.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { SessionMockRepository } from './session.mock';
import { Session } from '../types/session.types';

describe('SessionMockRepository', () => {
  let repo: SessionMockRepository;
  let sampleSession: Session;

  beforeEach(() => {
    repo = new SessionMockRepository();
    // Create a sample session for testing.
    sampleSession = {
      id: 'session-1',
      userId: 'user-1',
      refreshToken: 'refresh-token-1',
      userAgent: 'Test Agent',
      ipAddress: '127.0.0.1',
      expiresAt: new Date(Date.now() + 3600 * 1000), // Expires 1 hour from now
      isValid: true,
      lastUsedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    repo.reset();
  });

  describe('reset and setSessions/getAll', () => {
    it('should reset the repository', () => {
      repo.setSessions([sampleSession]);
      expect(repo.getAll().length).toBe(1);
      repo.reset();
      expect(repo.getAll().length).toBe(0);
    });

    it('should pre-populate the repository with setSessions', () => {
      repo.setSessions([sampleSession]);
      const all = repo.getAll();
      expect(all).toHaveLength(1);
      expect(all[0]).toEqual(sampleSession);
    });
  });

  describe('findById', () => {
    it('should return a session when found', async () => {
      repo.setSessions([sampleSession]);
      const session = await repo.findById('session-1');
      expect(session).toEqual(sampleSession);
    });

    it('should return null if session is not found', async () => {
      repo.setSessions([]);
      const session = await repo.findById('nonexistent');
      expect(session).toBeNull();
    });
  });

  describe('findByRefreshToken', () => {
    it('should return a session when found by refresh token', async () => {
      repo.setSessions([sampleSession]);
      const session = await repo.findByRefreshToken('refresh-token-1');
      expect(session).toEqual(sampleSession);
    });

    it('should return null if refresh token is not found', async () => {
      repo.setSessions([]);
      const session = await repo.findByRefreshToken('nonexistent-token');
      expect(session).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a session and return it with generated id and timestamps when not provided', async () => {
      // Create an input without id, createdAt, or updatedAt
      const input: Omit<Session, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: 'user-2',
        refreshToken: 'refresh-token-2',
        userAgent: 'Agent 2',
        ipAddress: '192.168.1.2',
        expiresAt: new Date(Date.now() + 7200 * 1000), // 2 hours later
        isValid: true,
        lastUsedAt: new Date(),
      } as any;
      const created = await repo.create(input as Session);

      expect(created.id).toBeDefined();
      expect(created.createdAt).toBeDefined();
      expect(created.updatedAt).toBeDefined();
      expect(created.userId).toBe(input.userId);
      expect(created.refreshToken).toBe(input.refreshToken);

      // Also, the repository should now contain one session.
      const all = repo.getAll();
      expect(all).toHaveLength(1);
    });

    it('should create a session and return it using provided id and timestamps', async () => {
      const created = await repo.create(sampleSession);
      expect(created).toEqual(sampleSession);
    });
  });

  describe('update', () => {
    it('should update an existing session and return the updated session', async () => {
      repo.setSessions([sampleSession]);
      // Create an update that changes the refresh token.
      const updateData: Session = {
        ...sampleSession,
        refreshToken: 'new-refresh-token',
      };
      const updated = await repo.update(updateData);
      expect(updated.id).toBe(sampleSession.id);
      expect(updated.refreshToken).toBe('new-refresh-token');
      // Check that updatedAt was refreshed.
      expect(updated.updatedAt).toBeInstanceOf(Date);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(sampleSession.updatedAt.getTime());
    });

    it('should throw an error if session to update is not found', async () => {
      repo.reset();
      await expect(repo.update({ ...sampleSession, id: 'nonexistent' })).rejects.toThrowError(
        'Session with id nonexistent not found'
      );
    });
  });

  describe('delete', () => {
    it('should delete a session by id', async () => {
      repo.setSessions([sampleSession]);
      await repo.delete(sampleSession.id);
      const session = await repo.findById(sampleSession.id);
      expect(session).toBeNull();
    });
  });

  describe('deleteAllByUserId', () => {
    it('should delete all sessions for a given user id', async () => {
      const session2: Session = { ...sampleSession, id: 'session-2', userId: 'user-1' };
      const session3: Session = { ...sampleSession, id: 'session-3', userId: 'user-2' };
      repo.setSessions([sampleSession, session2, session3]);
      await repo.deleteAllByUserId('user-1');
      const remaining = repo.getAll();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].userId).toBe('user-2');
    });
  });

  describe('deleteAllExpiredSessions', () => {
    it('should delete all sessions that have expired', async () => {
      const pastSession: Session = {
        ...sampleSession,
        id: 'expired-1',
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      };
      const futureSession: Session = {
        ...sampleSession,
        id: 'future-1',
        expiresAt: new Date(Date.now() + 10000), // Expires in 10 seconds
      };
      repo.setSessions([pastSession, futureSession]);
      await repo.deleteAllExpiredSessions();
      const remaining = repo.getAll();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('future-1');
    });
  });
});
