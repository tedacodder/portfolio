import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { listTimeline } from "@/lib/services/timeline.service";

export const GET = withErrorHandler(async () => {
  const rows = await listTimeline();
  return ok(rows);
});
