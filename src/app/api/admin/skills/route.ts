import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { createSkillSchema, skillListQuerySchema } from "@/lib/validation/skills";
import { createSkill, listSkills } from "@/lib/services/skills.service";

export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const filters = skillListQuerySchema.parse({
    category: request.nextUrl.searchParams.get("category") ?? undefined,
  });
  const rows = await listSkills(filters);
  return ok(rows);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const body = await request.json();
  const input = createSkillSchema.parse(body);
  const created = await createSkill(input);
  return ok(created, 201);
});
