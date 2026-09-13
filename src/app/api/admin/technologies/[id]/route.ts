import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { noContent, ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { uuidSchema } from "@/lib/validation/common";
import { updateTechnologySchema } from "@/lib/validation/technologies";
import {
  deleteTechnology,
  getTechnologyById,
  updateTechnology,
} from "@/lib/services/technologies.service";
import type { RouteParams } from "@/types/route-params";

// GET /api/admin/technologies/:id — Auth: required
export const GET = withErrorHandler(async (_request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  const technology = await getTechnologyById(uuidSchema.parse(id));
  return ok(technology);
});

// PATCH /api/admin/technologies/:id — Auth: required
export const PATCH = withErrorHandler(async (request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json();
  const input = updateTechnologySchema.parse(body);
  const updated = await updateTechnology(uuidSchema.parse(id), input);
  return ok(updated);
});

// DELETE /api/admin/technologies/:id — Auth: required
export const DELETE = withErrorHandler(async (_request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  await deleteTechnology(uuidSchema.parse(id));
  return noContent();
});
