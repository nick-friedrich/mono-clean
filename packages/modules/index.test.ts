// packages/modules/index.test.ts
import { describe, it, expect } from 'vitest';
import * as moduleExports from './index';

describe('Modules Index', () => {
  it('should export auth module components', () => {
    expect(moduleExports).toHaveProperty('AuthModule');
    expect(moduleExports).toHaveProperty('AuthService');
    expect(moduleExports).toHaveProperty('PasswordService');
  });

});