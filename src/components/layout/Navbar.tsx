"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import MobileMenu from "./MobileMenu";
import type { Profile } from "@/types/api";

const NAV_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/#experience", label: "Experience" },
  { href: "/#skills", label: "Skills" },
  { href: "/articles", label: "Articles" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar({
  name,
  availability,
}: {
  name: string;
  availability?: Profile["availability"];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled ? "border-b border-border bg-bg/72 backdrop-blur-md" : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className="container-page flex h-16 items-center justify-between md:h-20">
          <Link
            href="/"
            className="font-display text-sm font-medium tracking-tight text-text md:text-base"
          >
            {name || "PORTFOLIO"}
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-sm text-muted transition-colors hover:text-text"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {availability?.isAvailable && (
              <span className="hidden items-center gap-2 font-mono text-xs text-muted lg:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                {availability.label}
              </span>
            )}
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              className="text-text md:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={NAV_LINKS} />
    </>
  );
}
