"use client";

import type { ReactNode } from "react";
import type { Pagination } from "@/types/api";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export default function DataTable<T extends { id: string }>({
  rows,
  columns,
  status,
  error,
  emptyMessage,
  pagination,
  onPageChange,
  onRetry,
  actions,
}: {
  rows: T[];
  columns: Column<T>[];
  status: "loading" | "ready" | "error";
  error?: string;
  emptyMessage: string;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  /** Re-fetch the current page. When provided, the error state shows a "Retry" button instead of leaving the person stuck. */
  onRetry?: () => void;
  /** Optional per-row action buttons (edit/delete/publish), rendered as a trailing column. */
  actions?: (row: T) => ReactNode;
}) {
  if (status === "loading") {
    return (
      <div className="border border-border p-10 text-center" aria-busy="true">
        <p className="font-mono text-xs text-dim">Loading…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="border border-red-500/30 bg-red-500/5 p-10 text-center" role="alert">
        <p className="text-sm text-red-400">{error || "Unable to load data. Please try again."}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 border border-red-500/40 px-4 py-2 font-mono text-xs text-red-400 transition-colors hover:bg-red-500/10"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="border border-border p-10 text-center">
        <p className="text-sm text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="border border-border">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.header}
                  className="whitespace-nowrap px-4 py-3 font-mono text-[11px] uppercase tracking-wide text-dim"
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wide text-dim">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-border/20">
                {columns.map((col) => (
                  <td key={col.header} className={`px-4 py-3 align-top text-text ${col.className ?? ""}`}>
                    {col.render(row)}
                  </td>
                ))}
                {actions && <td className="px-4 py-3 align-top">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="font-mono text-xs text-dim">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="border border-border px-3 py-1 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="border border-border px-3 py-1 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
