import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { createCertificationSchema } from "@/lib/validation/certifications";
import { createCertification, listCertifications } from "@/lib/services/certifications.service";

export const GET = withErrorHandler(async () => {
  await requireAdmin();
  const rows = await listCertifications();
  return ok(rows);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const body = await request.json();
  const input = createCertificationSchema.parse(body);
  const created = await createCertification(input);
  return ok(created, 201);
});
