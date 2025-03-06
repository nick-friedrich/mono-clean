import { Session, SessionUpdateInput } from "../types/session.types";

/**
 * Session repository interface
 */
export abstract class SessionRepository {
  /**
   * Find a session by id
   * @param id - The id of the session
   * @returns The session or null if not found
   */
  abstract findById(id: string): Promise<Session | null>;

  /**
   * Find a session by refresh token
   * @param refreshToken - The refresh token of the session
   * @returns The session or null if not found
   */
  abstract findByRefreshToken(refreshToken: string): Promise<Session | null>;

  /**
   * Create a session
   * @param session - The session to create
   * @returns The created session
   */
  abstract create(session: Session): Promise<Session>;

  /**
   * Update a session
   * @param session - The session to update
   * @returns The updated session
   */
  abstract update(session: SessionUpdateInput): Promise<Session>;

  /**
   * Delete a session
   * @param id - The id of the session to delete
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Delete all sessions by user id
   * @param userId - The id of the user
   */
  abstract deleteAllByUserId(userId: string): Promise<void>;

  /**
   * Delete all expired sessions
   */
  abstract deleteAllExpiredSessions(): Promise<void>;

}