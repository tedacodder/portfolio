import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { noContent } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { uuidSchema } from "@/lib/validation/common";
import { deleteArchitectureConnection } from "@/lib/services/projects.service";
import type { RouteParams } from "@/types/route-params";

// DELETE /api/admin/projects/:id/architecture/connections/:connectionId — Auth: required
// Connections have no other editable fields worth a PATCH endpoint (from/to
// node identity is what makes a connection what it is) — remove and re-add
// to change them, same as the public graph would treat a rewired edge.
export const DELETE = withErrorHandler(
  async (_request: NextRequest, { params }: RouteParams<{ id: string; connectionId: string }>) => {
    await requireAdmin();
    const { id, connectionId } = await params;
    await deleteArchitectureConnection(uuidSchema.parse(id), uuidSchema.parse(connectionId));
    return noContent();
  },
);
