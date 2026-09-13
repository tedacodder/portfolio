import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { createPrincipleSchema } from "@/lib/validation/principles";
import { createPrinciple, listPrinciples } from "@/lib/services/principles.service";

export const GET = withErrorHandler(async () => {
  await requireAdmin();
  const rows = await listPrinciples();
  return ok(rows);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const body = await request.json();
  const input = createPrincipleSchema.parse(body);
  const created = await createPrinciple(input);
  return ok(created, 201);
});
