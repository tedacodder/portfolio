"use client";

import { useEffect, useRef, useState } from "react";
import type { Principle } from "@/types/api";

export default function Principles({ principles }: { principles: Principle[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            setActiveIndex(idx);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [principles.length]);

  if (principles.length === 0) return null;

  return (
    <div className="grid gap-px border border-border bg-border md:grid-cols-2">
      {principles
        .sort((a, b) => a.order - b.order)
        .map((principle, idx) => (
          <div
            key={principle.id}
            data-index={idx}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            className={`bg-bg p-8 transition-colors duration-500 ${
              activeIndex === idx ? "bg-panel" : ""
            }`}
          >
            <p
              className={`font-mono text-xs transition-colors duration-500 ${
                activeIndex === idx ? "text-accent" : "text-dim"
              }`}
            >
              {String(principle.order).padStart(2, "0")}
            </p>
            <h3 className="mt-3 font-display text-xl text-text">{principle.title}</h3>
            <p className="mt-2 text-sm text-muted">{principle.description}</p>
          </div>
        ))}
    </div>
  );
}
