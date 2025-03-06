import { SessionError } from "../interface/session.interface";
import { describe, it, expect } from "vitest";

describe('SessionError', () => {
  it('should be defined', () => {
    expect(SessionError).toBeDefined();
  });

  it('should extend Error', () => {
    expect(new SessionError('test')).toBeInstanceOf(Error);
  });

  it('should have a name property', () => {
    expect(new SessionError('test').name).toBe('SessionError');
  });


});