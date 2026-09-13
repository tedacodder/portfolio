"use client";

import { useEffect, useRef } from "react";
import { revealOnScroll } from "@/lib/animations/scrollReveal";
import EmptyState from "@/components/ui/EmptyState";
import type { Experience, Education } from "@/types/api";

function yearOf(dateString: string | null | undefined): string {
  if (!dateString) return "";
  return dateString.slice(0, 4);
}

function rangeLabel(start: string, end: string | null | undefined, current: boolean): string {
  const startYear = yearOf(start);
  if (current) return `${startYear}–NOW`;
  const endYear = yearOf(end);
  return endYear ? `${startYear}–${endYear}` : startYear;
}

export default function ExperienceTimeline({
  experiences,
  education,
}: {
  experiences: Experience[];
  education: Education[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      revealOnScroll(containerRef.current, "[data-timeline-item]");
    }
  }, [experiences.length]);

  if (experiences.length === 0 && education.length === 0) {
    return <EmptyState message="No experience published yet." />;
  }

  return (
    <div ref={containerRef} className="relative border-l border-border pl-8">
      {experiences.map((exp) => (
        <div key={exp.id} data-timeline-item className="relative pb-12 last:pb-0">
          <span
            className={`absolute -left-[calc(2rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full ${
              exp.current ? "bg-accent shadow-[0_0_0_4px_rgba(94,234,212,0.15)]" : "bg-dim"
            }`}
            aria-hidden="true"
          />
          <p className="font-mono text-xs text-accent">
            {exp.current ? "NOW" : rangeLabel(exp.startDate, exp.endDate, exp.current)}
          </p>
          <h3 className="mt-2 font-display text-xl text-text">{exp.role}</h3>
          {exp.company && (
            <p className="mt-1 font-mono text-xs text-dim">
              {exp.company}
              {exp.location ? ` · ${exp.location}` : ""}
            </p>
          )}
          {exp.description && (
            <p className="mt-2 max-w-xl text-sm text-muted">{exp.description}</p>
          )}
          {exp.highlights.length > 0 && (
            <ul className="mt-3 max-w-xl space-y-1.5">
              {exp.highlights.map((highlight, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted">
                  <span className="text-dim">–</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          )}
          {exp.technologies.length > 0 && (
            <p className="mt-3 font-mono text-[11px] text-dim">
              {exp.technologies.map((t) => t.name).join(" / ")}
            </p>
          )}
        </div>
      ))}

      {education.length > 0 && (
        <div data-timeline-item className="relative pt-4">
          <span className="absolute -left-[calc(2rem+5px)] top-5 h-2.5 w-2.5 rounded-full bg-dim" aria-hidden="true" />
          <p className="font-mono text-xs text-dim">EDUCATION</p>
          {education.map((ed) => (
            <div key={ed.id} className="mt-3">
              <h3 className="font-display text-xl text-text">{ed.institution}</h3>
              <p className="mt-1 font-mono text-xs text-dim">
                {ed.degree}
                {ed.fieldOfStudy ? `, ${ed.fieldOfStudy}` : ""} ·{" "}
                {rangeLabel(ed.startDate, ed.endDate, ed.current)}
              </p>
              {ed.description && <p className="mt-2 max-w-xl text-sm text-muted">{ed.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
