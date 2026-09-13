import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="section-kicker mb-4">404</p>
      <h1 className="font-display text-2xl text-text md:text-3xl">Page not found.</h1>
      <p className="mt-3 max-w-sm text-sm text-muted">
        Whatever you were looking for isn&rsquo;t here — it may have moved or never existed.
      </p>
      <Link
        href="/"
        className="mt-8 border border-text px-5 py-2.5 font-body text-sm text-text transition-colors hover:border-accent hover:text-accent"
      >
        Go home
      </Link>
    </div>
  );
}
