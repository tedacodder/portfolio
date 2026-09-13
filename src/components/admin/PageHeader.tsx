import Link from "next/link";
import type { ReactNode } from "react";

export default function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string } | ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl text-text">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action &&
        (typeof action === "object" && action !== null && "href" in action ? (
          <Link
            href={action.href}
            className="inline-flex items-center border border-text px-4 py-2 font-mono text-xs text-text transition-colors hover:border-accent hover:text-accent"
          >
            {action.label}
          </Link>
        ) : (
          action
        ))}
    </div>
  );
}
