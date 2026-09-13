import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "../auth/password";
import { AuthenticationError } from "../errors/app-error";
import { createSession, touchLastLogin } from "../auth/session";
import type { LoginInput } from "../validation/auth";

/**
 * Verifies credentials and creates a session. Deliberately returns the
 * same generic error for "no such user" and "wrong password" so the API
 * never confirms whether an email is registered (user enumeration
 * protection).
 */
export async function login(input: LoginInput) {
  const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);

  if (!user || !user.isActive) {
    throw new AuthenticationError("Invalid email or password");
  }

  const passwordValid = await verifyPassword(user.passwordHash, input.password);
  if (!passwordValid) {
    throw new AuthenticationError("Invalid email or password");
  }

  const { sessionId, expiresAt } = await createSession(user.id);
  await touchLastLogin(user.id);

  return {
    sessionId,
    expiresAt,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}
