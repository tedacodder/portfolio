import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { okList } from "@/lib/utils/response";
import { parsePagination } from "@/lib/validation/pagination";
import { buildPagination } from "@/lib/utils/response";
import { listProjects } from "@/lib/services/projects.service";

// GET /api/projects
// Auth: public — only ever returns status=PUBLISHED, regardless of query params.
// Query: ?page=&limit=&featured=
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const pagination = parsePagination(searchParams);
  const featuredParam = searchParams.get("featured");

  const { rows, total } = await listProjects(pagination, {
    status: "PUBLISHED",
    featured: featuredParam === null ? undefined : featuredParam === "true",
  });

  return okList(rows, buildPagination(pagination.page, pagination.limit, total));
});
