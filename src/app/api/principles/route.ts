import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { listPrinciples } from "@/lib/services/principles.service";

// GET /api/principles
// Auth: public — ordered by displayOrder for the About/Principles section.
export const GET = withErrorHandler(async () => {
  const rows = await listPrinciples();
  return ok(rows);
});
