import * as argon2 from 'argon2';

/**
 * Password Service
 */
export class PasswordService {

  /**
   * Hash a password
   * @param password - The password to hash
   * @returns The hashed password
   */
  static async hash(password: string): Promise<string> {
    return argon2.hash(password);
  }

  /**
   * Verify a password
   * @param plainPassword - The plain password
   * @param hashedPassword - The hashed password
   * @returns True if the password is verified, false otherwise
   */
  static async verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return argon2.verify(hashedPassword, plainPassword);
  }
}