import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { noContent, ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { uuidSchema } from "@/lib/validation/common";
import { updateArchitectureNodeSchema } from "@/lib/validation/projects";
import { deleteArchitectureNode, updateArchitectureNode } from "@/lib/services/projects.service";
import type { RouteParams } from "@/types/route-params";

// PATCH /api/admin/projects/:id/architecture/nodes/:nodeId — Auth: required
export const PATCH = withErrorHandler(
  async (request: NextRequest, { params }: RouteParams<{ id: string; nodeId: string }>) => {
    await requireAdmin();
    const { id, nodeId } = await params;
    const body = await request.json();
    const input = updateArchitectureNodeSchema.parse(body);
    const updated = await updateArchitectureNode(uuidSchema.parse(id), uuidSchema.parse(nodeId), input);
    return ok(updated);
  },
);

// DELETE /api/admin/projects/:id/architecture/nodes/:nodeId — Auth: required
// Also removes any connections referencing this node (see service comment).
export const DELETE = withErrorHandler(
  async (_request: NextRequest, { params }: RouteParams<{ id: string; nodeId: string }>) => {
    await requireAdmin();
    const { id, nodeId } = await params;
    await deleteArchitectureNode(uuidSchema.parse(id), uuidSchema.parse(nodeId));
    return noContent();
  },
);
