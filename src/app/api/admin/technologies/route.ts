import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok, okList } from "@/lib/utils/response";
import { parsePagination } from "@/lib/validation/pagination";
import { buildPagination } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { createTechnologySchema, technologyListQuerySchema } from "@/lib/validation/technologies";
import { createTechnology, listTechnologies } from "@/lib/services/technologies.service";

// GET /api/admin/technologies — Auth: required
export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const searchParams = request.nextUrl.searchParams;
  const pagination = parsePagination(searchParams);
  const filters = technologyListQuerySchema.parse({
    category: searchParams.get("category") ?? undefined,
    featured: searchParams.get("featured") ?? undefined,
  });

  const { rows, total } = await listTechnologies(pagination, filters);
  return okList(rows, buildPagination(pagination.page, pagination.limit, total));
});

// POST /api/admin/technologies — Auth: required
export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const body = await request.json();
  const input = createTechnologySchema.parse(body);
  const created = await createTechnology(input);
  return ok(created, 201);
});
