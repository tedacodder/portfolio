"use client";

import { useEffect, useRef, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import type { LearningTopic } from "@/types/api";

export default function LearningList({ topics }: { topics: LearningTopic[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (topics.length === 0) {
    return <EmptyState message="Nothing in progress right now." />;
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {topics.map((topic) => (
        <div key={topic.id}>
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-mono text-xs text-muted">{topic.title.toUpperCase()}</p>
            <p className="font-mono text-xs text-dim">{topic.progress}%</p>
          </div>
          <div className="mt-2 h-[2px] w-full bg-border">
            <div
              className="h-full bg-accent transition-[width] duration-[1200ms] ease-out"
              style={{ width: animated ? `${topic.progress}%` : "0%" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
