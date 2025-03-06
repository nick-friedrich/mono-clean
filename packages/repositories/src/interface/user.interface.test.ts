import { UserError } from "../interface/user.interface";
import { describe, it, expect } from "vitest";

describe('UserError', () => {
  it('should be defined', () => {
    expect(UserError).toBeDefined();
  });

  it('should extend Error', () => {
    expect(new UserError('test')).toBeInstanceOf(Error);
  });

  it('should have a name property', () => {
    expect(new UserError('test').name).toBe('UserError');
  });


});