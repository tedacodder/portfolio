"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Pagination } from "@/types/api";
import { ApiError } from "@/lib/api/admin";

interface ListResult<T> {
  data: T[];
  pagination?: Pagination;
}

/**
 * Shared data-fetching state machine for every admin list screen: loading /
 * error / empty state, pagination, and a `reload()` escape hatch for after
 * mutations.
 *
 * The fetch callback is stored in a ref so inline callbacks passed by
 * consuming components do not cause the loading effect to run again on
 * every render.
 */
export function useAdminList<T>(
  fetchPage: (page: number) => Promise<ListResult<T>>,
) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<Pagination | undefined>(
    undefined,
  );
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const fetchPageRef = useRef(fetchPage);

  useEffect(() => {
    fetchPageRef.current = fetchPage;
  }, [fetchPage]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await fetchPageRef.current(page);

        if (cancelled) return;

        setData(result.data);
        setPagination(result.pagination);
        setStatus("ready");
        setError("");
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof ApiError ? err.message : "Failed to load data.",
        );
        setStatus("error");
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [page, reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return {
    data,
    pagination,
    status,
    error,
    page,
    setPage,
    reload,
  };
}