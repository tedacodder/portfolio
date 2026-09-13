import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function SectionKicker({ children }: { children: ReactNode }) {
  return <p className="section-kicker mb-4">{children}</p>;
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display text-3xl leading-tight text-text md:text-4xl">
      {children}
    </h2>
  );
}

export default function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("py-20 md:py-28", className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}
