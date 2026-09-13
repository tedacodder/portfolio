import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok, okList } from "@/lib/utils/response";
import { parsePagination } from "@/lib/validation/pagination";
import { buildPagination } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { articleListQuerySchema, createArticleSchema } from "@/lib/validation/articles";
import { createArticle, listArticles } from "@/lib/services/articles.service";

export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const searchParams = request.nextUrl.searchParams;
  const pagination = parsePagination(searchParams);
  const filters = articleListQuerySchema.parse({
    status: searchParams.get("status") ?? undefined,
    featured: searchParams.get("featured") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
  });

  const { rows, total } = await listArticles(pagination, filters);
  return okList(rows, buildPagination(pagination.page, pagination.limit, total));
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const body = await request.json();
  const input = createArticleSchema.parse(body);
  const created = await createArticle(input);
  return ok(created, 201);
});
