import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { createTimelineEntrySchema } from "@/lib/validation/timeline";
import { createTimelineEntry, listTimeline } from "@/lib/services/timeline.service";

export const GET = withErrorHandler(async () => {
  await requireAdmin();
  const rows = await listTimeline();
  return ok(rows);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const body = await request.json();
  const input = createTimelineEntrySchema.parse(body);
  const created = await createTimelineEntry(input);
  return ok(created, 201);
});
