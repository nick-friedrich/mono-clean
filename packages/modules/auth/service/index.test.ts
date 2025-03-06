import { AuthService, PasswordService } from './index';
import { describe, it, expect } from 'vitest';

describe('Index Re-exports', () => {
  it('should export AuthService', () => {
    expect(AuthService).toBeDefined();
    expect(typeof AuthService).toBe('function'); // since it's a class
  });

  it('should export PasswordService', () => {
    expect(PasswordService).toBeDefined();
    expect(typeof PasswordService).toBe('function'); // assuming it's a class or a function
  });
});
