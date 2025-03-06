import { AuthModule, AuthService, PasswordService, UserLoginWithEmailAndPasswordInputSchema } from './index';
import { describe, it, expect } from 'vitest';

describe('Index Re-exports', () => {
  it('should export AuthModule', () => {
    expect(AuthModule).toBeDefined();
    expect(typeof AuthModule).toBe('function'); // since it's a class
  });

  it('should export AuthService', () => {
    expect(AuthService).toBeDefined();
    expect(typeof AuthService).toBe('function'); // assuming it's a class or a function
  });

  it('should export PasswordService', () => {
    expect(PasswordService).toBeDefined();
    expect(typeof PasswordService).toBe('function'); // assuming it's a class or a function
  });

  it('should export UserLoginWithEmailAndPasswordInputSchema', () => {
    expect(UserLoginWithEmailAndPasswordInputSchema).toBeDefined();
    expect(typeof UserLoginWithEmailAndPasswordInputSchema).toBe('object'); // assuming it's a class or a function
  });

});
