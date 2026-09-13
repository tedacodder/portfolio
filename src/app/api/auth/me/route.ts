import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";

// GET /api/auth/me
// Auth: required
// Response: { success: true, data: { user } }
export const GET = withErrorHandler(async () => {
  const user = await requireAdmin();
  return ok({ user });
});
