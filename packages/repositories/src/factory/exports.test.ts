import { describe, it, expect } from 'vitest';
import * as factoryExports from './index';

describe('Factory Exports', () => {
  it('should export all user factory functions and objects', () => {
    // Test that all expected exports exist
    expect(factoryExports).toHaveProperty('getUserRepository');
    expect(factoryExports).toHaveProperty('userRepository');
    expect(typeof factoryExports.getUserRepository).toBe('function');
    expect(factoryExports.userRepository).toBeDefined();
  });
}); 