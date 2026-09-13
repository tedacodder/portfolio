import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { createContactMessageSchema } from "@/lib/validation/contact";
import { submitContactMessage } from "@/lib/services/contact.service";
import { enforceRateLimit, getClientIp } from "@/lib/utils/rate-limit";

// POST /api/contact — Auth: public.
// Protections against spam/abuse:
//   1. Rate limiting per IP (5 submissions / 10 minutes).
//   2. A hidden honeypot field (`website`) — real visitors never fill it in
//      because it's hidden via CSS on the frontend; bots that fill every
//      field trip it. Honeypot hits are silently accepted (200) without
//      being stored, so bots get no signal that they were caught.
//   3. Zod validation caps name/subject/message length.
// Submitted messages are never exposed via any public endpoint.
export const POST = withErrorHandler(async (request: NextRequest) => {
  enforceRateLimit({ key: `contact:${getClientIp(request)}`, limit: 5, windowMs: 10 * 60_000 });

  const body = await request.json();
  const input = createContactMessageSchema.parse(body);

  if (input.website) {
    // Honeypot tripped — pretend success, do not persist.
    return ok({ received: true }, 201);
  }

  const created = await submitContactMessage(input);
  return ok({ id: created.id, received: true }, 201);
});
