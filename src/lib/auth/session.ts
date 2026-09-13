import { eq, and, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { SESSION_TTL_SECONDS } from "./cookies";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN";
}

/** Creates a new database-backed session for a user and returns its id. */
export async function createSession(userId: string): Promise<{ sessionId: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  const [session] = await db
    .insert(sessions)
    .values({ userId, expiresAt })
    .returning({ id: sessions.id });

  if (!session) {
    throw new Error("Failed to create session");
  }

  return { sessionId: session.id, expiresAt };
}

/**
 * Resolves a session cookie value to the authenticated user, or null if the
 * session doesn't exist, is expired, or the user has been deactivated.
 * Never returns the password hash.
 */
export async function getSessionUser(sessionId: string | undefined): Promise<SessionUser | null> {
  if (!sessionId) return null;

  const [result] = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (!result || !result.isActive) return null;

  return {
    id: result.userId,
    email: result.email,
    name: result.name,
    role: result.role,
  };
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

/** Removes expired sessions. Intended to be called periodically (e.g. cron, or opportunistically on login). */
export async function pruneExpiredSessions(): Promise<void> {
  const { lt } = await import("drizzle-orm");
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

export async function touchLastLogin(userId: string): Promise<void> {
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));
}
