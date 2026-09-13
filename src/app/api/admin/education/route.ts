import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { createEducationSchema } from "@/lib/validation/education";
import { createEducation, listEducation } from "@/lib/services/education.service";

export const GET = withErrorHandler(async () => {
  await requireAdmin();
  const rows = await listEducation();
  return ok(rows);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const body = await request.json();
  const input = createEducationSchema.parse(body);
  const created = await createEducation(input);
  return ok(created, 201);
});
