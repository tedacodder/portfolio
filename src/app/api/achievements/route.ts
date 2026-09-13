import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { listAchievements } from "@/lib/services/achievements.service";

export const GET = withErrorHandler(async () => {
  const rows = await listAchievements();
  return ok(rows);
});
