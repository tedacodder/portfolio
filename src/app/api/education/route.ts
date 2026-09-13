import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { listEducation } from "@/lib/services/education.service";

// GET /api/education — Auth: public. Not paginated, same rationale as experiences.
export const GET = withErrorHandler(async () => {
  const rows = await listEducation();
  return ok(rows);
});
