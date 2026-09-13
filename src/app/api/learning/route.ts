import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { learningListQuerySchema } from "@/lib/validation/learning";
import { listLearningTopics } from "@/lib/services/learning.service";

// GET /api/learning — Auth: public. Query: ?status=
export const GET = withErrorHandler(async (request: NextRequest) => {
  const filters = learningListQuerySchema.parse({
    status: request.nextUrl.searchParams.get("status") ?? undefined,
  });
  const rows = await listLearningTopics(filters);
  return ok(rows);
});
