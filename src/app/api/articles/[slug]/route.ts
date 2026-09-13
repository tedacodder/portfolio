import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { getArticleBySlug } from "@/lib/services/articles.service";
import { slugSchema } from "@/lib/validation/common";
import type { RouteParams } from "@/types/route-params";

// GET /api/articles/:slug — Auth: public. 404s for anything not PUBLISHED.
export const GET = withErrorHandler(async (_request: NextRequest, { params }: RouteParams<{ slug: string }>) => {
  const { slug } = await params;
  const article = await getArticleBySlug(slugSchema.parse(slug), { onlyPublished: true });
  return ok(article);
});
