"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Profile } from "@/types/api";

const HeroScene = lazy(() => import("./HeroScene"));

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function Hero({ profile }: { profile: Profile | null }) {
  const [canRender3D, setCanRender3D] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const smallViewport = window.innerWidth < 640;
    // Feature detection only exists client-side; this is a legitimate
    // one-time sync with the browser environment on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduceMotion(reduced);
    // Skip the 3D scene entirely on small/touch devices to protect performance;
    // fall back to the CSS treatment there even when WebGL is technically available.
     
    setCanRender3D(detectWebGL() && !(isCoarsePointer && smallViewport));
  }, []);

  const name = profile?.name ?? "";
  const location = profile?.location ?? "";
  const bio = profile?.shortBio ?? profile?.bio ?? "";
  const headline = profile?.headline || "I build systems, not just websites.";

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden border-b border-border">
      <div className="absolute inset-0" aria-hidden="true">
        {canRender3D ? (
          <Suspense fallback={null}>
            <HeroScene reduceMotion={reduceMotion} />
          </Suspense>
        ) : (
          <div
            className="h-full w-full opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--color-accent) 10%, transparent), transparent 60%)",
            }}
          />
        )}
      </div>

      <div className="container-page relative z-10">
        <p className="section-kicker mb-6">
          {location ? `LOCATION: ${location.toUpperCase()}` : "SYSTEM: ONLINE"}
          {location ? " / SYSTEM: ONLINE" : ""}
        </p>

        <h1 className="max-w-3xl font-display text-4xl leading-[1.1] text-text sm:text-5xl md:text-6xl lg:text-7xl">
          {headline}
        </h1>

        {bio && (
          <p className="mt-6 max-w-xl text-base text-muted md:text-lg">{bio}</p>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-5">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 border border-text px-5 py-3 font-body text-sm text-text transition-colors hover:border-accent hover:text-accent"
          >
            View My Work <ArrowRight size={16} />
          </Link>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 font-body text-sm text-muted transition-colors hover:text-text"
          >
            Let&rsquo;s Connect <ArrowUpRight size={16} />
          </Link>
        </div>

        {name && (
          <p className="mt-16 font-mono text-xs text-dim">{name.toUpperCase()}</p>
        )}
      </div>
    </section>
  );
}
