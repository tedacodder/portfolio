import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { uuidSchema } from "@/lib/validation/common";
import { upsertArchitectureConnectionSchema } from "@/lib/validation/projects";
import { addArchitectureConnection } from "@/lib/services/projects.service";
import type { RouteParams } from "@/types/route-params";

// POST /api/admin/projects/:id/architecture/connections — Auth: required
export const POST = withErrorHandler(async (request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json();
  const input = upsertArchitectureConnectionSchema.parse(body);
  const created = await addArchitectureConnection(uuidSchema.parse(id), input);
  return ok(created, 201);
});
