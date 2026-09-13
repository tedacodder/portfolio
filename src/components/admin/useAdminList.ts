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
 * mutations. Every resource page uses this instead of re-deriving the same
 * five `useState` calls.
 *
 * FIX: every call site passes an inline `async (p) => ...` callback, which
 * is a brand-new function identity on every render. Previously `fetchPage`
 * was itself an effect dependency, so: fetch resolves -> setStatus/setData
 * triggers a re-render -> the caller re-creates the inline function -> the
 * effect's dependency changed -> the effect re-fires -> another fetch ->
 * another render -> ... forever. That infinite loop was hammering every
 * admin list endpoint on every page load. `fetchPage` is now captured in a
 * ref that's kept current on every render (a plain assignment during
 * render, not a `useEffect`, so it never itself triggers a re-render or
 * needs to be an effect dependency), and the effect only re-runs when the
 * page or an explicit `reload()` actually changes.
 *
 * State setters are only ever called from inside promise callbacks, never
 * synchronously in the effect body — `setStatus("loading")` is deferred
 * through a microtask so the effect itself just kicks off work rather than
 * updating state directly (see react-hooks/set-state-in-effect).
 */
export function useAdminList<T>(fetchPage: (page: number) => Promise<ListResult<T>>) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<Pagination | undefined>(undefined);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  useEffect(() => {
    let cancelled = false;

    Promise.resolve()
      .then(() => {
        if (cancelled) return Promise.reject(new Error("cancelled"));
        setStatus("loading");
        return fetchPageRef.current(page);
      })
      .then((result) => {
        if (cancelled) return;
        setData(result.data);
        setPagination(result.pagination);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled || (err instanceof Error && err.message === "cancelled")) return;
        setError(err instanceof ApiError ? err.message : "Failed to load data.");
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchPage is read from fetchPageRef precisely so it is not a dependency; see comment above.
  }, [page, reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((t) => t + 1);
  }, []);

  return { data, pagination, status, error, page, setPage, reload };
}
