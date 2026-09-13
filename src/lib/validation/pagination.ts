import { z } from "zod";

// Reusable pagination query-param schema. Enforced maximum prevents clients
// from requesting unbounded result sets.
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export function parsePagination(searchParams: URLSearchParams): PaginationQuery {
  return paginationQuerySchema.parse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });
}

export function toOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
