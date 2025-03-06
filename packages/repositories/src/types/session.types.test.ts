import { describe, it, expect } from 'vitest';
import { SessionSchema, SessionUpdateInputSchema } from './session.types';

describe('SessionSchema', () => {
  it('should validate a valid session object', () => {
    const validSession = {
      id: '1',
      userId: 'user1',
      refreshToken: 'refresh-token',
      userAgent: 'Mozilla/5.0',
      ipAddress: '127.0.0.1',
      expiresAt: new Date('2025-01-01T00:00:00Z'),
      isValid: true,
      lastUsedAt: new Date('2025-01-01T00:00:00Z'),
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    };

    const parsed = SessionSchema.parse(validSession);
    expect(parsed).toEqual(validSession);
  });

  it('should throw an error when a required field is missing', () => {
    const invalidSession = {
      // missing id field
      userId: 'user1',
      refreshToken: 'refresh-token',
      userAgent: 'Mozilla/5.0',
      ipAddress: '127.0.0.1',
      expiresAt: new Date('2025-01-01T00:00:00Z'),
      isValid: true,
      lastUsedAt: new Date('2025-01-01T00:00:00Z'),
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    };

    expect(() => SessionSchema.parse(invalidSession)).toThrow();
  });

  it('should throw an error when a field has the wrong type', () => {
    const invalidSession = {
      id: 123, // should be string
      userId: 'user1',
      refreshToken: 'refresh-token',
      userAgent: 'Mozilla/5.0',
      ipAddress: '127.0.0.1',
      expiresAt: "2025-01-01T00:00:00Z", // should be a Date object
      isValid: true,
      lastUsedAt: new Date('2025-01-01T00:00:00Z'),
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    };

    expect(() => SessionSchema.parse(invalidSession)).toThrow();
  });
});
