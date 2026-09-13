import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { getProfile } from "@/lib/services/profile.service";

// GET /api/profile
// Auth: public
// Response: { success: true, data: profile } — the full public profile in one request.
export const GET = withErrorHandler(async () => {
  const profile = await getProfile();
  return ok(profile);
});
