"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;
export function ensureGsapPlugins() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Fade-up reveal for a set of elements within a container, triggered on scroll. */
export function revealOnScroll(
  container: HTMLElement,
  selector: string,
  options: { stagger?: number; y?: number } = {}
) {
  ensureGsapPlugins();
  if (prefersReducedMotion()) return;

  const targets = container.querySelectorAll(selector);
  if (!targets.length) return;

  gsap.fromTo(
    targets,
    { opacity: 0, y: options.y ?? 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: options.stagger ?? 0.08,
      scrollTrigger: {
        trigger: container,
        start: "top 78%",
        once: true,
      },
    }
  );
}
