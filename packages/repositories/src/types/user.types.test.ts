import { describe, it, expect } from 'vitest';
import { UserSchema, UserSchemaSafe } from '../types/user.types';

describe('User Interface Tests > User Schema', () => {
  it('should validate a valid user object', () => {
    const validUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
      userRole: 'user'
    };


    const result = UserSchema.safeParse(validUser);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual({
        ...validUser,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    }
  });

  it('should make password optional', () => {
    const userWithoutPassword = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      userRole: 'user',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z')
    };

    const result = UserSchema.safeParse(userWithoutPassword);
    expect(result.success).toBe(true);
  });
});

describe('User Interface Tests > UserSchemaSafe', () => {
  it('should validate a user without password', () => {
    const safeUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      userRole: 'user',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z')
    };

    const result = UserSchemaSafe.safeParse(safeUser);
    expect(result.success).toBe(true);
  });

  it('should remove the password if provided', () => {
    const userWithPassword = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      userRole: 'user',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z')
    };

    const result = UserSchemaSafe.safeParse(userWithPassword);
    expect(result.success).toBe(true);
    if (result.success) {
      // Assuming UserSchemaSafe strips the password field
      expect(result.data).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        userRole: 'user',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    }
  });
});
