import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { skillListQuerySchema } from "@/lib/validation/skills";
import { listSkills } from "@/lib/services/skills.service";

// GET /api/skills — Auth: public. Query: ?category=
export const GET = withErrorHandler(async (request: NextRequest) => {
  const filters = skillListQuerySchema.parse({
    category: request.nextUrl.searchParams.get("category") ?? undefined,
  });
  const rows = await listSkills(filters);
  return ok(rows);
});
