import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { noContent, ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { uuidSchema } from "@/lib/validation/common";
import { updateSkillSchema } from "@/lib/validation/skills";
import { deleteSkill, getSkillById, updateSkill } from "@/lib/services/skills.service";
import type { RouteParams } from "@/types/route-params";

export const GET = withErrorHandler(async (_request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  const row = await getSkillById(uuidSchema.parse(id));
  return ok(row);
});

export const PATCH = withErrorHandler(async (request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json();
  const input = updateSkillSchema.parse(body);
  const updated = await updateSkill(uuidSchema.parse(id), input);
  return ok(updated);
});

export const DELETE = withErrorHandler(async (_request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  await deleteSkill(uuidSchema.parse(id));
  return noContent();
});
