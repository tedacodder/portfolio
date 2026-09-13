import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { okList } from "@/lib/utils/response";
import { parsePagination } from "@/lib/validation/pagination";
import { buildPagination } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { contactStatusSchema } from "@/lib/validation/contact";
import { listContactMessages } from "@/lib/services/contact.service";

// GET /api/admin/contact — Auth: required. Query: ?page=&limit=&status=
export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const searchParams = request.nextUrl.searchParams;
  const pagination = parsePagination(searchParams);
  const statusParam = searchParams.get("status");
  const status = statusParam ? contactStatusSchema.parse(statusParam) : undefined;

  const { rows, total } = await listContactMessages(pagination, { status });
  return okList(rows, buildPagination(pagination.page, pagination.limit, total));
});
