import { eq, lt } from "drizzle-orm";
import { sessionsTable } from "@shared/db-drizzle-pg/src/schema/sessions";
import { db } from "@shared/db-drizzle-pg";
import { Session } from "../types/session.types";
import { SessionRepository } from "../interface/session.interface";


export class SessionDrizzleRepository extends SessionRepository {
  /**
   * Find a session by id
   * @param id - The id of the session
   * @returns The session or null if not found
   */
  async findById(id: string): Promise<Session | null> {
    const session = await db.query.sessionsTable.findFirst({
      where: eq(sessionsTable.id, id),
    })

    if (!session) {
      return null;
    }

    return {
      id: session.id,
      userId: session.userId,
      refreshToken: session.refreshToken,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      expiresAt: session.expiresAt,
      isValid: session.isValid,
      lastUsedAt: session.lastUsedAt,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    };
  }

  /**
   * Find a session by refresh token
   * @param refreshToken - The refresh token of the session
   * @returns The session or null if not found
   */
  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    const session = await db.query.sessionsTable.findFirst({
      where: eq(sessionsTable.refreshToken, refreshToken),
    })

    if (!session) {
      return null;
    }

    return {
      id: session.id,
      userId: session.userId,
      refreshToken: session.refreshToken,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      expiresAt: session.expiresAt,
      isValid: session.isValid,
      lastUsedAt: session.lastUsedAt,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    };
  }

  /**
   * Create a session
   * @param session - The session to create
   * @returns The created session
   */
  async create(session: Session): Promise<Session> {
    const createdSession = await db.insert(sessionsTable).values(session).returning();

    return {
      id: createdSession[0].id,
      userId: createdSession[0].userId,
      refreshToken: createdSession[0].refreshToken,
      userAgent: createdSession[0].userAgent,
      ipAddress: createdSession[0].ipAddress,
      expiresAt: createdSession[0].expiresAt,
      isValid: createdSession[0].isValid,
      lastUsedAt: createdSession[0].lastUsedAt,
      createdAt: createdSession[0].created_at,
      updatedAt: createdSession[0].updated_at,
    };
  }

  /**
   * Update a session
   * @param session - The session to update
   * @returns The updated session
   */
  async update(session: Session): Promise<Session> {
    const updatedSession = await db.update(sessionsTable).set(session).where(eq(sessionsTable.id, session.id)).returning();

    return {
      id: updatedSession[0].id,
      userId: updatedSession[0].userId,
      refreshToken: updatedSession[0].refreshToken,
      userAgent: updatedSession[0].userAgent,
      ipAddress: updatedSession[0].ipAddress,
      expiresAt: updatedSession[0].expiresAt,
      isValid: updatedSession[0].isValid,
      lastUsedAt: updatedSession[0].lastUsedAt,
      createdAt: updatedSession[0].created_at,
      updatedAt: updatedSession[0].updated_at,
    };
  }

  /**
   * Delete a session
   * @param id - The id of the session to delete
   */
  async delete(id: string): Promise<void> {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, id));
  }

  /**
   * Delete all sessions by user id
   * @param userId - The id of the user
   */
  async deleteAllByUserId(userId: string): Promise<void> {
    await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
  }

  /**
   * Delete all expired sessions
   */
  async deleteAllExpiredSessions(): Promise<void> {
    await db.delete(sessionsTable).where(lt(sessionsTable.expiresAt, new Date()));
  }
}