// packages/modules/auth/service/auth.service.ts
import { UserRepository } from "@shared/repository";
import { PasswordService } from "./password.service";

export class AuthService {
  constructor(private userRepository: UserRepository) { }

  async signInWithEmailAndPassword(email: string, password: string) {
    // Implementation
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.password) {
      throw new Error("Invalid credentials");
    }

    // Add password validation logic here
    const isPasswordValid = await PasswordService.verify(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }
    return { user };
  }

  async signUpWithEmailAndPassword(email: string, password: string, name?: string) {
    // Implementation
    // Check if user exists, create if not, etc.
    return { user: { email } };
  }

  async signOut() {
    // Implementation
    return { success: true };
  }
}