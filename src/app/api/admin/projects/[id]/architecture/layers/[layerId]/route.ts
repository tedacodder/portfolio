import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { noContent, ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { uuidSchema } from "@/lib/validation/common";
import { updateArchitectureLayerSchema } from "@/lib/validation/projects";
import { deleteArchitectureLayer, updateArchitectureLayer } from "@/lib/services/projects.service";
import type { RouteParams } from "@/types/route-params";

// PATCH /api/admin/projects/:id/architecture/layers/:layerId — Auth: required
export const PATCH = withErrorHandler(
  async (request: NextRequest, { params }: RouteParams<{ id: string; layerId: string }>) => {
    await requireAdmin();
    const { id, layerId } = await params;
    const body = await request.json();
    const input = updateArchitectureLayerSchema.parse(body);
    const updated = await updateArchitectureLayer(uuidSchema.parse(id), uuidSchema.parse(layerId), input);
    return ok(updated);
  },
);

// DELETE /api/admin/projects/:id/architecture/layers/:layerId — Auth: required
export const DELETE = withErrorHandler(
  async (_request: NextRequest, { params }: RouteParams<{ id: string; layerId: string }>) => {
    await requireAdmin();
    const { id, layerId } = await params;
    await deleteArchitectureLayer(uuidSchema.parse(id), uuidSchema.parse(layerId));
    return noContent();
  },
);
