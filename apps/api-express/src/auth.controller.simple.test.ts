import { describe, it, expect } from 'vitest';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  it('should be defined', () => {
    const controller = new AuthController();
    expect(controller).toBeDefined();
  });

  it('should have signInWithEmailAndPassword method', () => {
    const controller = new AuthController();
    expect(controller.signInWithEmailAndPassword).toBeDefined();
    expect(typeof controller.signInWithEmailAndPassword).toBe('function');
  });

  it('should have signUpWithEmailAndPassword method', () => {
    const controller = new AuthController();
    expect(controller.signUpWithEmailAndPassword).toBeDefined();
    expect(typeof controller.signUpWithEmailAndPassword).toBe('function');
  });
}); 