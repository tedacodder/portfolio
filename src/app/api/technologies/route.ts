import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { okList } from "@/lib/utils/response";
import { parsePagination } from "@/lib/validation/pagination";
import { buildPagination } from "@/lib/utils/response";
import { technologyListQuerySchema } from "@/lib/validation/technologies";
import { attachProficiency, listTechnologies } from "@/lib/services/technologies.service";

// GET /api/technologies
// Auth: public
// Query: ?page=&limit=&category=&featured=
// Rows include `proficiency` when a linked `skills` row has one set — see
// attachProficiency() for why that lives on skills, not technologies.
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const pagination = parsePagination(searchParams);
  const filters = technologyListQuerySchema.parse({
    category: searchParams.get("category") ?? undefined,
    featured: searchParams.get("featured") ?? undefined,
  });

  const { rows, total } = await listTechnologies(pagination, filters);
  const withProficiency = await attachProficiency(rows);
  return okList(withProficiency, buildPagination(pagination.page, pagination.limit, total));
});
