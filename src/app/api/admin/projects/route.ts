import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok, okList } from "@/lib/utils/response";
import { parsePagination } from "@/lib/validation/pagination";
import { buildPagination } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { createProjectSchema, projectListQuerySchema } from "@/lib/validation/projects";
import { createProject, listProjects } from "@/lib/services/projects.service";

// GET /api/admin/projects — Auth: required. Returns projects of any status.
export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const searchParams = request.nextUrl.searchParams;
  const pagination = parsePagination(searchParams);
  const filters = projectListQuerySchema.parse({
    status: searchParams.get("status") ?? undefined,
    featured: searchParams.get("featured") ?? undefined,
  });

  const { rows, total } = await listProjects(pagination, filters);
  return okList(rows, buildPagination(pagination.page, pagination.limit, total));
});

// POST /api/admin/projects — Auth: required
export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const body = await request.json();
  const input = createProjectSchema.parse(body);
  const created = await createProject(input);
  return ok(created, 201);
});
