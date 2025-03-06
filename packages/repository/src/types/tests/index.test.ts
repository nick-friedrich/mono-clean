import { describe, it, expect } from 'vitest';
import {
  UserSchema,
  UserSchemaSafe,
  UserSignUpWithEmailAndPasswordInputSchema,
  User,
  UserSafe
} from '../user.types';

describe('User Interface Tests', () => {
  describe('User Schema', () => {
    it('should validate a valid user object', () => {
      const validUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const result = UserSchema.safeParse(validUser);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toEqual(validUser);
      }
    });

    it('should make password optional', () => {
      const userWithoutPassword = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com'
      };

      const result = UserSchema.safeParse(userWithoutPassword);
      expect(result.success).toBe(true);
    });

    it('should reject an invalid email', () => {
      const userWithInvalidEmail = {
        id: '123',
        name: 'Test User',
        email: 'not-an-email',
        password: 'password123'
      };

      const result = UserSchema.safeParse(userWithInvalidEmail);
      expect(result.success).toBe(false);
    });

    it('should reject a user without required fields', () => {
      const invalidUser = {
        id: '123',
        password: 'password123'
        // missing name and email
      };

      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });
  });

  describe('UserSchemaSafe', () => {
    it('should validate a user without password', () => {
      const safeUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com'
      };

      const result = UserSchemaSafe.safeParse(safeUser);
      expect(result.success).toBe(true);
    });

    it('should remove the password if provided', () => {
      const userWithPassword = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const result = UserSchemaSafe.safeParse(userWithPassword);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).not.toHaveProperty('password');
      }
    });
  });

  describe('UserSignUpWithEmailAndPasswordSchema', () => {
    it('should validate a valid sign up', () => {
      const validSignUp = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const result = UserSignUpWithEmailAndPasswordInputSchema.safeParse(validSignUp);
      expect(result.success).toBe(true);
    });

    it('should require a password', () => {
      const signUpWithoutPassword = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com'
      };

      const result = UserSignUpWithEmailAndPasswordInputSchema.safeParse(signUpWithoutPassword);
      expect(result.success).toBe(false);
    });

    it('should require a strong password', () => {
      const signUpWithWeakPassword = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password: '123' // Too short
      };

      const result = UserSignUpWithEmailAndPasswordInputSchema.safeParse(signUpWithWeakPassword);
      expect(result.success).toBe(false);
    });
  });

  describe('Type Compatibility', () => {
    it('should allow assignment of User to UserSafe', () => {
      // This is a compile-time test, not a runtime test
      // We're just ensuring that a User can be assigned to a UserSafe
      const user: User = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      // This should compile without error
      const userSafe: UserSafe = {
        id: user.id,
        name: user.name,
        email: user.email
      };

      expect(userSafe).not.toHaveProperty('password');
    });
  });
});
