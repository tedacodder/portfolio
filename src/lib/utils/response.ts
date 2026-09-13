import { NextResponse } from "next/server";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// The three response shapes required by the spec: single-item success,
// paginated list success, and error (error shape lives in lib/errors/handler.ts
// since only the error handler constructs it).
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function okList<T>(data: T[], pagination: Pagination, status = 200): NextResponse {
  return NextResponse.json({ success: true, data, pagination }, { status });
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function buildPagination(page: number, limit: number, total: number): Pagination {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
