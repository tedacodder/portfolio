"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { gsap } from "gsap";

interface NavLink {
  href: string;
  label: string;
}

export default function MobileMenu({
  open,
  onClose,
  links,
}: {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (open) {
      panel.style.display = "flex";
      if (!reduced) {
        gsap.fromTo(
          panel,
          { autoAlpha: 0, y: -16 },
          { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }
        );
        gsap.fromTo(
          panel.querySelectorAll("[data-menu-item]"),
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.05, delay: 0.1, ease: "power2.out" }
        );
      } else {
        gsap.set(panel, { autoAlpha: 1, y: 0 });
      }
    } else if (!reduced) {
      gsap.to(panel, {
        autoAlpha: 0,
        y: -16,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          if (panel) panel.style.display = "none";
        },
      });
    } else {
      panel.style.display = "none";
    }
  }, [open]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className="fixed inset-0 z-[60] hidden flex-col bg-bg"
      style={{ display: "none" }}
    >
      <div className="container-page flex h-16 items-center justify-end md:h-20">
        <button
          type="button"
          aria-label="Close navigation menu"
          className="text-text"
          onClick={onClose}
        >
          <X size={22} />
        </button>
      </div>
      <nav className="container-page flex flex-1 flex-col justify-center gap-6 pb-24">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            data-menu-item
            onClick={onClose}
            className="font-display text-4xl text-text transition-colors hover:text-accent"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
