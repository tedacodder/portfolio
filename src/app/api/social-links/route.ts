import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { listSocialLinks } from "@/lib/services/social-links.service";

// GET /api/social-links — Auth: public. Only returns visible=true links.
export const GET = withErrorHandler(async () => {
  const rows = await listSocialLinks({ onlyVisible: true });
  return ok(rows);
});
