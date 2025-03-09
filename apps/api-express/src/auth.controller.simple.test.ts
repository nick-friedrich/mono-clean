import { describe, it, expect } from 'vitest';
import { AuthController } from './auth.controller';
import { AuthModule, AuthModuleConfig, JwtTokenService } from '@shared/module';
import { SessionMockRepository, sessionRepository, UserMockRepository } from '@shared/repository';

const authConfig: AuthModuleConfig = {
  jwt: {
    secret: 'secret',
    expiresIn: '1h',
  },
};
const authModule = AuthModule.getInstance(
  authConfig,
  new UserMockRepository(),
  new SessionMockRepository(),
  new JwtTokenService(authConfig.jwt)
);

describe('AuthController', () => {
  it('should be defined', () => {
    const controller = new AuthController(authModule);
    expect(controller).toBeDefined();
  });

  it('should have signInWithEmailAndPassword method', () => {
    const controller = new AuthController(authModule);
    expect(controller.signInWithEmailAndPassword).toBeDefined();
    expect(typeof controller.signInWithEmailAndPassword).toBe('function');
  });

  it('should have signUpWithEmailAndPassword method', () => {
    const controller = new AuthController(authModule);
    expect(controller.signUpWithEmailAndPassword).toBeDefined();
    expect(typeof controller.signUpWithEmailAndPassword).toBe('function');
  });
}); 