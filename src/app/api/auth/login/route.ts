import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { loginSchema } from "@/lib/validation/auth";
import { login } from "@/lib/services/users.service";
import { setSessionCookie } from "@/lib/auth/cookies";
import { enforceRateLimit, getClientIp } from "@/lib/utils/rate-limit";

// POST /api/auth/login
// Auth: public (this IS the auth endpoint)
// Body: { email, password }
// Response: { success: true, data: { user } } + sets session cookie
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Rate limit login attempts per IP to slow down credential stuffing.
  enforceRateLimit({ key: `login:${getClientIp(request)}`, limit: 10, windowMs: 60_000 });

  const body = await request.json();
  const input = loginSchema.parse(body);

  const { sessionId, user } = await login(input);

  const response = ok({ user });
  setSessionCookie(response, sessionId);
  return response;
});
