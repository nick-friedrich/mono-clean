import { describe, it, expect } from 'vitest';
import * as repositoryExports from '../index';

describe('Repository Main Exports', () => {
  it('should export all the required modules', () => {
    // Test that all expected exports exist
    expect(repositoryExports).toHaveProperty('userRepository');
    expect(repositoryExports).toHaveProperty('getUserRepository');
    expect(repositoryExports).toHaveProperty('AbstractUserRepository');
    expect(repositoryExports).toHaveProperty('UserSchema');
    expect(repositoryExports).toHaveProperty('UserSchemaSafe');
  });
}); 