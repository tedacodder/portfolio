"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import Section, { SectionKicker, SectionHeading } from "@/components/ui/Section";

const SystemDesignScene = lazy(() => import("./SystemDesignScene"));

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

const FALLBACK_STAGES = ["USER", "GATEWAY", "AUTH", "REDIS", "SERVICES", "POSTGRES", "EXTERNAL"];

export default function SystemDesignSection() {
  const [canRender3D, setCanRender3D] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Feature detection only exists client-side; this is a legitimate
    // one-time sync with the browser environment on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
     
    setCanRender3D(detectWebGL());
  }, []);

  return (
    <Section id="system-design" className="border-t border-border">
      <SectionKicker>SYSTEM DESIGN</SectionKicker>
      <SectionHeading>How a request moves through the system.</SectionHeading>

      <div className="mt-10 h-[420px] border border-border md:h-[520px]">
        {canRender3D ? (
          <Suspense fallback={null}>
            <SystemDesignScene reduceMotion={reduceMotion} />
          </Suspense>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
            {FALLBACK_STAGES.map((stage, i) => (
              <div key={stage} className="flex flex-col items-center">
                <div className="border border-border px-4 py-2 font-mono text-xs text-text">
                  {stage}
                </div>
                {i < FALLBACK_STAGES.length - 1 && (
                  <div className="h-4 w-px bg-border" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
