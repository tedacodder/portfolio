import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { noContent, ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { uuidSchema } from "@/lib/validation/common";
import { updateCertificationSchema } from "@/lib/validation/certifications";
import { deleteCertification, getCertificationById, updateCertification } from "@/lib/services/certifications.service";
import type { RouteParams } from "@/types/route-params";

export const GET = withErrorHandler(async (_request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  const row = await getCertificationById(uuidSchema.parse(id));
  return ok(row);
});

export const PATCH = withErrorHandler(async (request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json();
  const input = updateCertificationSchema.parse(body);
  const updated = await updateCertification(uuidSchema.parse(id), input);
  return ok(updated);
});

export const DELETE = withErrorHandler(async (_request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  await deleteCertification(uuidSchema.parse(id));
  return noContent();
});
