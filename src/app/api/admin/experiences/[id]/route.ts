import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { noContent, ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { uuidSchema } from "@/lib/validation/common";
import { updateExperienceSchema } from "@/lib/validation/experiences";
import { deleteExperience, getExperienceById, updateExperience } from "@/lib/services/experiences.service";
import type { RouteParams } from "@/types/route-params";

// GET /api/admin/experiences/:id — Auth: required
export const GET = withErrorHandler(async (_request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  const row = await getExperienceById(uuidSchema.parse(id));
  return ok(row);
});

// PATCH /api/admin/experiences/:id — Auth: required
export const PATCH = withErrorHandler(async (request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json();
  const input = updateExperienceSchema.parse(body);
  const updated = await updateExperience(uuidSchema.parse(id), input);
  return ok(updated);
});

// DELETE /api/admin/experiences/:id — Auth: required
export const DELETE = withErrorHandler(async (_request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  await deleteExperience(uuidSchema.parse(id));
  return noContent();
});
