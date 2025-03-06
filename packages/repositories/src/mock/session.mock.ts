// src/mock/session.repository.ts
import { SessionRepository } from '../interface/session.interface';
import { Session } from '../types/session.types';
import { v4 as uuidv4 } from 'uuid';

export class SessionMockRepository extends SessionRepository {
  private sessions: Session[] = [];

  /**
   * Reset the repository to an empty state.
   */
  reset(): void {
    this.sessions = [];
  }

  /**
   * Pre-populate the repository with test data.
   */
  setSessions(sessions: Session[]): void {
    this.sessions = [...sessions];
  }

  /**
   * Helper method to get all sessions.
   */
  getAll(): Session[] {
    return [...this.sessions];
  }

  /**
   * Find a session by its id.
   * @param id - The id of the session.
   * @returns The session or null if not found.
   */
  async findById(id: string): Promise<Session | null> {
    const session = this.sessions.find(s => s.id === id);
    return session ? { ...session } : null;
  }

  /**
   * Find a session by its refresh token.
   * @param refreshToken - The refresh token of the session.
   * @returns The session or null if not found.
   */
  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    const session = this.sessions.find(s => s.refreshToken === refreshToken);
    return session ? { ...session } : null;
  }

  /**
   * Create a new session.
   * @param session - The session data.
   * @returns The created session.
   */
  async create(session: Session): Promise<Session> {
    const newSession: Session = {
      ...session,
      id: session.id || uuidv4(),
      createdAt: session.createdAt || new Date(),
      updatedAt: session.updatedAt || new Date(),
    };
    this.sessions.push(newSession);
    return { ...newSession };
  }

  /**
   * Update an existing session.
   * @param session - The session data to update.
   * @returns The updated session.
   */
  async update(session: Session): Promise<Session> {
    const index = this.sessions.findIndex(s => s.id === session.id);
    if (index === -1) {
      throw new Error(`Session with id ${session.id} not found`);
    }
    // Merge the new data into the existing session and update updatedAt.
    const updatedSession: Session = {
      ...this.sessions[index],
      ...session,
      updatedAt: new Date(),
    };
    this.sessions[index] = updatedSession;
    return { ...updatedSession };
  }

  /**
   * Delete a session by its id.
   * @param id - The id of the session to delete.
   */
  async delete(id: string): Promise<void> {
    this.sessions = this.sessions.filter(s => s.id !== id);
  }

  /**
   * Delete all sessions for a given user id.
   * @param userId - The user id whose sessions should be deleted.
   */
  async deleteAllByUserId(userId: string): Promise<void> {
    this.sessions = this.sessions.filter(s => s.userId !== userId);
  }

  /**
   * Delete all expired sessions.
   */
  async deleteAllExpiredSessions(): Promise<void> {
    const now = new Date();
    this.sessions = this.sessions.filter(s => s.expiresAt > now);
  }
}
