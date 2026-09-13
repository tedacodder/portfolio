import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { noContent, ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { uuidSchema } from "@/lib/validation/common";
import { updateProjectSchema } from "@/lib/validation/projects";
import { deleteProject, getProjectById, updateProject } from "@/lib/services/projects.service";
import type { RouteParams } from "@/types/route-params";

// GET /api/admin/projects/:id — Auth: required
export const GET = withErrorHandler(async (_request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  const project = await getProjectById(uuidSchema.parse(id));
  return ok(project);
});

// PATCH /api/admin/projects/:id — Auth: required
export const PATCH = withErrorHandler(async (request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json();
  const input = updateProjectSchema.parse(body);
  const updated = await updateProject(uuidSchema.parse(id), input);
  return ok(updated);
});

// DELETE /api/admin/projects/:id — Auth: required
export const DELETE = withErrorHandler(async (_request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  await deleteProject(uuidSchema.parse(id));
  return noContent();
});
