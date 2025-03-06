import { describe, it, expect } from 'vitest';
import * as repositoryExports from './index';
import * as typesExports from './types';

describe('Repository Main Exports', () => {
  it('should export all the required modules', () => {
    // Test that all expected exports exist
    expect(repositoryExports).toHaveProperty('userRepository');
    expect(repositoryExports).toHaveProperty('getUserRepository');
    expect(repositoryExports).toHaveProperty('UserRepository');
    expect(typesExports).toHaveProperty('UserSchema');
    expect(typesExports).toHaveProperty('UserSchemaSafe');
  });
}); 