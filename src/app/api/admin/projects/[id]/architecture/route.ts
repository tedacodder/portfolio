import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { uuidSchema } from "@/lib/validation/common";
import { getProjectArchitecture } from "@/lib/services/projects.service";
import type { RouteParams } from "@/types/route-params";

// GET /api/admin/projects/:id/architecture — Auth: required
// Returns the full layers/nodes/connections graph for a project, regardless
// of the project's publish status (the public equivalent is nested inside
// GET /api/projects/:slug and only ever works for published projects).
export const GET = withErrorHandler(async (_request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  const architecture = await getProjectArchitecture(uuidSchema.parse(id));
  return ok(architecture);
});
