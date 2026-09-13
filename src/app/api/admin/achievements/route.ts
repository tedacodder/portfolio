import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { createAchievementSchema } from "@/lib/validation/achievements";
import { createAchievement, listAchievements } from "@/lib/services/achievements.service";

export const GET = withErrorHandler(async () => {
  await requireAdmin();
  const rows = await listAchievements();
  return ok(rows);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const body = await request.json();
  const input = createAchievementSchema.parse(body);
  const created = await createAchievement(input);
  return ok(created, 201);
});
