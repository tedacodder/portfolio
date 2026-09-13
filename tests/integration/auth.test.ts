import { afterAll, beforeAll, describe, expect, it } from "vitest";

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)("authentication (integration)", () => {
  // These imports touch src/db, which throws at import time if
  // DATABASE_URL is unset — so they're deferred into beforeAll, which only
  // runs when the describe block isn't skipped.
  let db: typeof import("@/db").db;
  let schema: typeof import("@/db/schema");
  let login: typeof import("@/lib/services/users.service").login;
  let getSessionUser: typeof import("@/lib/auth/session").getSessionUser;
  let hashPassword: typeof import("@/lib/auth/password").hashPassword;
  let AuthenticationError: typeof import("@/lib/errors/app-error").AuthenticationError;
  let eq: typeof import("drizzle-orm").eq;

  const testEmail = `test-auth-${Date.now()}@example.com`;
  const testPassword = "a-strong-test-password";
  let userId: string;

  beforeAll(async () => {
    ({ db } = await import("@/db"));
    schema = await import("@/db/schema");
    ({ login } = await import("@/lib/services/users.service"));
    ({ getSessionUser } = await import("@/lib/auth/session"));
    ({ hashPassword } = await import("@/lib/auth/password"));
    ({ AuthenticationError } = await import("@/lib/errors/app-error"));
    ({ eq } = await import("drizzle-orm"));

    const passwordHash = await hashPassword(testPassword);
    const [user] = await db
      .insert(schema.users)
      .values({ email: testEmail, passwordHash, name: "Test Admin", role: "ADMIN" })
      .returning();
    userId = user!.id;
  });

  afterAll(async () => {
    if (userId) {
      await db.delete(schema.users).where(eq(schema.users.id, userId));
    }
  });

  it("logs in with valid credentials and creates a resolvable session", async () => {
    const { sessionId, user } = await login({ email: testEmail, password: testPassword });
    expect(user.email).toBe(testEmail);

    const sessionUser = await getSessionUser(sessionId);
    expect(sessionUser?.id).toBe(userId);
  });

  it("rejects an invalid password", async () => {
    await expect(login({ email: testEmail, password: "wrong-password" })).rejects.toThrow(AuthenticationError);
  });

  it("rejects a nonexistent user with the same error as a wrong password (no enumeration)", async () => {
    await expect(
      login({ email: "does-not-exist@example.com", password: "whatever" }),
    ).rejects.toThrow(AuthenticationError);
  });

  it("returns null for an unknown session id", async () => {
    const result = await getSessionUser("00000000-0000-0000-0000-000000000000");
    expect(result).toBeNull();
  });
});
