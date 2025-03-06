import { PasswordService } from "./password.service";
import { describe, it, expect } from "vitest";

describe("PasswordService", () => {
  it("should hash and verify passwords", async () => {
    const password = "password";
    const hashedPassword = await PasswordService.hash(password);
    const isVerified = await PasswordService.verify(password, hashedPassword);
    expect(isVerified).toBe(true);
  });
});