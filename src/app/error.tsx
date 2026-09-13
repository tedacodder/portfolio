"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
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
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="section-kicker mb-4">ERROR</p>
      <h1 className="font-display text-2xl text-text md:text-3xl">
        Something went wrong.
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted">
        This part of the page couldn&rsquo;t load. You can try again, or head back home.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={reset}
          className="border border-text px-5 py-2.5 font-body text-sm text-text transition-colors hover:border-accent hover:text-accent"
        >
          Try again
        </button>
        <Link href="/" className="font-body text-sm text-muted transition-colors hover:text-text">
          Go home
        </Link>
      </div>
    </div>
  );
}
