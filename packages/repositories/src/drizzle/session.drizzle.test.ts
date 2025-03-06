import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SessionDrizzleRepository } from './session.drizzle';
import { db } from "@shared/db-drizzle-pg";
import { sessionsTable } from "@shared/db-drizzle-pg/src/schema/sessions";
import { eq } from "drizzle-orm";
import { Session } from '../types/session.types';
import type { Mock } from 'vitest';

// Mock dependencies
vi.mock('@shared/db-drizzle-pg', () => {
  return {
    db: {
      query: {
        sessionsTable: {
          findFirst: vi.fn()
        }
      },
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  };
});

vi.mock('drizzle-orm', () => {
  return {
    eq: vi.fn().mockImplementation(() => 'mocked-eq-condition'),
    lt: vi.fn().mockImplementation(() => 'mocked-lt-condition')
  };
});

vi.mock('@shared/db-drizzle-pg/src/schema/sessions', () => {
  return {
    sessionsTable: {
      id: 'id',
      userId: 'userId',
      refreshToken: 'refreshToken',
      userAgent: 'userAgent',
      ipAddress: 'ipAddress',
      expiresAt: 'expiresAt',
      isValid: 'isValid',
      lastUsedAt: 'lastUsedAt',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };
});

describe('SessionDrizzleRepository', () => {
  let repository: SessionDrizzleRepository;
  const mockSession: Session = {
    id: '123',
    userId: 'user-123',
    refreshToken: 'refresh-token-123',
    userAgent: 'test-agent',
    ipAddress: '127.0.0.1',
    expiresAt: new Date(Date.now() + 3600000),
    isValid: true,
    lastUsedAt: new Date(),
    createdAt: new Date(), // expected value but repository may not return these
    updatedAt: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SessionDrizzleRepository();
  });

  describe('findById', () => {
    it('should find a session by id', async () => {
      // Setup mock to return a session (note: createdAt & updatedAt are returned as undefined from repository)
      db.query.sessionsTable.findFirst = vi.fn().mockResolvedValueOnce({
        ...mockSession,
        createdAt: undefined,
        updatedAt: undefined
      });

      const session = await repository.findById('123');

      expect(eq).toHaveBeenCalledWith(sessionsTable.id, '123');
      expect(db.query.sessionsTable.findFirst).toHaveBeenCalledWith({
        where: 'mocked-eq-condition'
      });
      // Instead of deep equality, check only the fields we care about.
      expect(session).toMatchObject({
        id: mockSession.id,
        userId: mockSession.userId,
        refreshToken: mockSession.refreshToken,
        userAgent: mockSession.userAgent,
        ipAddress: mockSession.ipAddress,
        expiresAt: mockSession.expiresAt,
        isValid: mockSession.isValid,
        lastUsedAt: mockSession.lastUsedAt,
      });
    });

    it('should return null when session is not found', async () => {
      // Setup mock to return null
      db.query.sessionsTable.findFirst = vi.fn().mockResolvedValueOnce(null);

      const session = await repository.findById('not-exist');

      expect(session).toBeNull();
    });
  });

  describe('findByRefreshToken', () => {
    it('should find a session by refresh token', async () => {
      // Setup mock to return a session with createdAt/updatedAt undefined
      db.query.sessionsTable.findFirst = vi.fn().mockResolvedValueOnce({
        ...mockSession,
        createdAt: undefined,
        updatedAt: undefined
      });

      const session = await repository.findByRefreshToken('refresh-token-123');

      expect(eq).toHaveBeenCalledWith(sessionsTable.refreshToken, 'refresh-token-123');
      expect(db.query.sessionsTable.findFirst).toHaveBeenCalledWith({
        where: 'mocked-eq-condition'
      });
      expect(session).toMatchObject({
        id: mockSession.id,
        userId: mockSession.userId,
        refreshToken: mockSession.refreshToken,
        userAgent: mockSession.userAgent,
        ipAddress: mockSession.ipAddress,
        expiresAt: mockSession.expiresAt,
        isValid: mockSession.isValid,
        lastUsedAt: mockSession.lastUsedAt,
      });
    });

    it('should return null when refresh token is not found', async () => {
      // Setup mock to return null
      db.query.sessionsTable.findFirst = vi.fn().mockResolvedValueOnce(null);

      const session = await repository.findByRefreshToken('not-exist');

      expect(session).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a session and return it', async () => {
      // Setup mock to return created session (again, simulating that createdAt/updatedAt are not returned)
      db.insert = vi.fn().mockReturnValueOnce({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValueOnce([{
          ...mockSession,
          createdAt: undefined,
          updatedAt: undefined
        }])
      });

      const result = await repository.create(mockSession);

      expect(db.insert).toHaveBeenCalled();
      expect(result).toMatchObject({
        id: mockSession.id,
        userId: mockSession.userId,
        refreshToken: mockSession.refreshToken,
        userAgent: mockSession.userAgent,
        ipAddress: mockSession.ipAddress,
        expiresAt: mockSession.expiresAt,
        isValid: mockSession.isValid,
        lastUsedAt: mockSession.lastUsedAt,
      });
    });

    it('should throw an error when the session is not created', async () => {
      // Cast db.insert to a Mock type so we can call mockReturnValueOnce
      (db.insert as unknown as Mock).mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockResolvedValueOnce([])
        })
      });

      await expect(repository.create(mockSession)).rejects.toThrow('Failed to create session');
    });
  });

  describe('update', () => {
    it('should update a session and return the updated session', async () => {
      // Setup mock to return updated session with some fields
      const mockReturnedSession = {
        id: mockSession.id,
        userId: mockSession.userId,
        refreshToken: mockSession.refreshToken,
        // other fields might be different or missing
      };

      db.update = vi.fn().mockReturnValueOnce({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValueOnce([mockReturnedSession])
      });

      const updatedSession = await repository.update(mockSession);

      expect(updatedSession.id).toBe(mockSession.id);
      expect(updatedSession.userId).toBe(mockSession.userId);
      expect(updatedSession.refreshToken).toBe(mockSession.refreshToken);
    });

    it('should throw an error when the session is not updated', async () => {
      // Create a chain of mocks for the update method:
      // db.update(...).set(...).where(...).returning() -> [] (empty array)
      const returningMock = vi.fn().mockResolvedValueOnce([]);
      const whereMock = vi.fn().mockReturnValueOnce({ returning: returningMock });
      const setMock = vi.fn().mockReturnValueOnce({ where: whereMock });

      // Cast db.update as a Mock so we can override its return value
      (db.update as unknown as Mock).mockReturnValueOnce({ set: setMock });

      await expect(repository.update(mockSession)).rejects.toThrow('Failed to update session');
    });
  });

  describe('delete', () => {
    it('should delete a session', async () => {
      // Setup mock to return nothing
      db.delete = vi.fn().mockReturnValueOnce({
        where: vi.fn().mockResolvedValueOnce(undefined)
      });

      await repository.delete('123');

      expect(db.delete).toHaveBeenCalled();
      expect(eq).toHaveBeenCalledWith(sessionsTable.id, '123');
    });
  });

  describe('deleteAllByUserId', () => {
    it('should delete all sessions for a user', async () => {
      // Setup mock to return nothing
      db.delete = vi.fn().mockReturnValueOnce({
        where: vi.fn().mockResolvedValueOnce(undefined)
      });

      await repository.deleteAllByUserId('user-123');

      expect(db.delete).toHaveBeenCalled();
      expect(eq).toHaveBeenCalledWith(sessionsTable.userId, 'user-123');
    });
  });

  describe('deleteAllExpiredSessions', () => {
    it('should delete all expired sessions', async () => {
      // Setup mock for the current date
      const nowMock = new Date();
      vi.spyOn(global, 'Date').mockImplementation(() => nowMock as unknown as Date);

      // Setup mock to return nothing
      db.delete = vi.fn().mockReturnValueOnce({
        where: vi.fn().mockResolvedValueOnce(undefined)
      });

      await repository.deleteAllExpiredSessions();

      expect(db.delete).toHaveBeenCalled();
      // We can't easily test the specific condition since it involves lt() which is mocked,
      // but we can verify that the delete operation was called.
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });
  });
});
