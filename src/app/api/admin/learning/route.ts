import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { createLearningTopicSchema, learningListQuerySchema } from "@/lib/validation/learning";
import { createLearningTopic, listLearningTopics } from "@/lib/services/learning.service";

export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const filters = learningListQuerySchema.parse({
    status: request.nextUrl.searchParams.get("status") ?? undefined,
  });
  const rows = await listLearningTopics(filters);
  return ok(rows);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const body = await request.json();
  const input = createLearningTopicSchema.parse(body);
  const created = await createLearningTopic(input);
  return ok(created, 201);
});
