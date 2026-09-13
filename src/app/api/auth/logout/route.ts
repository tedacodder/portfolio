import { cookies } from "next/headers";
import { withErrorHandler } from "@/lib/errors/handler";
import { noContent } from "@/lib/utils/response";
import { clearSessionCookie, SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { deleteSession } from "@/lib/auth/session";

// POST /api/auth/logout
// Auth: none required (logging out with no/invalid session is a no-op success)
// Response: 204 No Content, clears session cookie
export const POST = withErrorHandler(async () => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    await deleteSession(sessionId);
  }

  const response = noContent();
  clearSessionCookie(response);
  return response;
});
