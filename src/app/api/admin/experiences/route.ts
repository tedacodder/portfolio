import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { createExperienceSchema } from "@/lib/validation/experiences";
import { createExperience, listExperiences } from "@/lib/services/experiences.service";

// GET /api/admin/experiences — Auth: required
export const GET = withErrorHandler(async () => {
  await requireAdmin();
  const rows = await listExperiences();
  return ok(rows);
});

// POST /api/admin/experiences — Auth: required
export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const body = await request.json();
  const input = createExperienceSchema.parse(body);
  const created = await createExperience(input);
  return ok(created, 201);
});
