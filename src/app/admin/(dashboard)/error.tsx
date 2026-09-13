"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * FIX: there was no error boundary anywhere under the admin dashboard
 * route group, so any thrown error in a server-rendered admin page (a
 * failed DB query, a rethrown non-NotFound error from an `[id]` page,
 * etc.) fell all the way through to the root `src/app/error.tsx`. That
 * boundary replaces the entire app shell, so the admin sidebar/nav
 * disappeared and the person landed on the public-site "Go home" screen
 * with no way back into the admin panel except retyping the URL. This
 * boundary sits *inside* the already-successfully-rendered admin layout
 * (see `(dashboard)/layout.tsx`), so the sidebar and nav stay visible and
 * only the broken page content is replaced — consistent with "don't make
 * the whole thing unusable because one part failed" everywhere else in
 * this audit.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center border border-red-500/30 bg-red-500/5 px-6 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-red-400">Error</p>
      <h1 className="mt-3 font-display text-xl text-text">This page couldn&rsquo;t load.</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Something went wrong loading this data. You can try again, or head back to the dashboard.
      </p>
      <div className="mt-6 flex gap-4">
        <button
          type="button"
          onClick={reset}
          className="border border-text px-5 py-2.5 font-mono text-xs text-text transition-colors hover:border-accent hover:text-accent"
        >
          Try again
        </button>
        <Link
          href="/admin"
          className="inline-flex items-center font-mono text-xs text-muted underline underline-offset-4 transition-colors hover:text-text"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
