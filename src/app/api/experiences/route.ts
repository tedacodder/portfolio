import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { listExperiences } from "@/lib/services/experiences.service";

// GET /api/experiences — Auth: public. Not paginated: work history is a
// small, complete list the frontend renders all at once (a timeline/list
// section), unlike projects/articles which can grow unbounded.
export const GET = withErrorHandler(async () => {
  const rows = await listExperiences();
  return ok(rows);
});
