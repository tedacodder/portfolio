import { cookies } from "next/headers";
import { AuthenticationError } from "../errors/app-error";
import { getSessionUser, type SessionUser } from "./session";
import { SESSION_COOKIE_NAME } from "./cookies";

/**
 * Resolves the current request's authenticated admin user, or throws
 * AuthenticationError. Every protected admin route handler calls this
 * first, before touching validation or business logic — so there is one
 * place that defines "what counts as authenticated" for the whole API.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const user = await getSessionUser(sessionId);
  if (!user) {
    throw new AuthenticationError();
  }

  // Only one role exists today, but this check is what future roles
  // (e.g. EDITOR with reduced permissions) would extend.
  if (user.role !== "ADMIN") {
    throw new AuthenticationError();
  }

  return user;
}

/** Non-throwing variant, for endpoints that behave differently for admins vs anonymous users. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return getSessionUser(sessionId);
}
