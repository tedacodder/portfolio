import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { okList } from "@/lib/utils/response";
import { parsePagination } from "@/lib/validation/pagination";
import { buildPagination } from "@/lib/utils/response";
import { listArticles } from "@/lib/services/articles.service";

// GET /api/articles — Auth: public. Only ever returns status=PUBLISHED.
// Query: ?page=&limit=&featured=&tag=
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const pagination = parsePagination(searchParams);
  const featuredParam = searchParams.get("featured");

  const { rows, total } = await listArticles(pagination, {
    status: "PUBLISHED",
    featured: featuredParam === null ? undefined : featuredParam === "true",
    tag: searchParams.get("tag") ?? undefined,
  });

  return okList(rows, buildPagination(pagination.page, pagination.limit, total));
});
