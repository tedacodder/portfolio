import Link from "next/link";

/**
 * FIX: without this file, `notFound()` calls from any admin `[id]` edit
 * page (project, article, experience, education, skill, etc. — every
 * resource does this when the id doesn't exist) rendered the root
 * `src/app/not-found.tsx`, which drops the admin sidebar/nav and points
 * "Go home" at the public marketing site instead of back into the admin
 * panel. This keeps the admin chrome intact for a routine "that record
 * was already deleted" situation.
 */
export default function AdminNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center border border-border px-6 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-dim">404</p>
      <h1 className="mt-3 font-display text-xl text-text">Not found.</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        This record doesn&rsquo;t exist — it may have already been deleted.
      </p>
      <Link
        href="/admin"
        className="mt-6 inline-flex items-center border border-text px-5 py-2.5 font-mono text-xs text-text transition-colors hover:border-accent hover:text-accent"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
