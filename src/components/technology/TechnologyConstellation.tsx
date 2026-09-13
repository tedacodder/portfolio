"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import Section, { SectionKicker, SectionHeading } from "@/components/ui/Section";
import EmptyState from "@/components/ui/EmptyState";
import type { Technology } from "@/types/api";

const TechnologyScene = lazy(() => import("./TechnologyScene"));

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export default function TechnologyConstellation({
  technologies,
}: {
  technologies: Technology[];
}) {
  const [active, setActive] = useState<Technology | null>(null);
  const [canRender3D, setCanRender3D] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Feature detection only exists client-side; this is a legitimate
    // one-time sync with the browser environment on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
     
    setCanRender3D(detectWebGL());
  }, []);

  if (technologies.length === 0) {
    return (
      <Section id="skills">
        <SectionKicker>TECHNOLOGY</SectionKicker>
        <SectionHeading>What I build with.</SectionHeading>
        <div className="mt-10">
          <EmptyState message="No technologies published yet." />
        </div>
      </Section>
    );
  }

  return (
    <Section id="skills">
      <SectionKicker>TECHNOLOGY</SectionKicker>
      <SectionHeading>What I build with.</SectionHeading>

      <div className="mt-10 grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div className="relative h-[360px] border border-border md:h-[440px]" data-cursor-interactive>
          {canRender3D ? (
            <Suspense fallback={null}>
              <TechnologyScene
                technologies={technologies}
                onSelect={setActive}
                reduceMotion={reduceMotion}
              />
            </Suspense>
          ) : (
            // Accessible, non-WebGL fallback: a plain wrapped list of the same data.
            <div className="flex h-full flex-wrap content-center gap-3 p-8">
              {technologies.map((tech) => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => setActive(tech)}
                  onMouseEnter={() => setActive(tech)}
                  className="border border-border px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  {tech.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-h-[120px] border border-border p-6">
          {active ? (
            <>
              <p className="font-display text-lg text-text">{active.name}</p>
              <p className="mt-2 text-sm text-muted">{active.description}</p>
            </>
          ) : (
            <p className="font-mono text-xs text-dim">
              {canRender3D ? "Hover a node to inspect it." : "Select a technology to inspect it."}
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}
