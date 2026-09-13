"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { adminLogout } from "@/lib/api/admin";
import { useToast } from "./Toast";
import type { SessionUser } from "@/lib/auth/session";

const NAV_GROUPS: { label: string; items: { href: string; label: string }[] }[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/profile", label: "Profile" },
      { href: "/admin/principles", label: "Principles" },
      { href: "/admin/projects", label: "Projects" },
      { href: "/admin/experience", label: "Experience" },
      { href: "/admin/education", label: "Education" },
      { href: "/admin/technologies", label: "Technologies" },
      { href: "/admin/skills", label: "Skills" },
      { href: "/admin/articles", label: "Articles" },
      { href: "/admin/learning", label: "Learning" },
      { href: "/admin/achievements", label: "Achievements" },
      { href: "/admin/certifications", label: "Certifications" },
      { href: "/admin/social-links", label: "Social Links" },
      { href: "/admin/timeline", label: "Timeline" },
    ],
  },
  {
    label: "Inbox",
    items: [{ href: "/admin/contact", label: "Contact Messages" }],
  },
];

export default function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { notify } = useToast();
  const [isPending, startTransition] = useTransition();
  // Mobile nav starts closed; the sidebar is only ever forced open on
  // large screens via the `lg:` classes below, so this state is inert
  // (and harmless) on desktop.
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // FIX: close the mobile nav automatically after navigating so it
  // doesn't stay open covering the new page's content on the next visit.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  function handleLogout() {
    startTransition(async () => {
      try {
        await adminLogout();
        router.replace("/admin/login");
        router.refresh();
      } catch {
        notify("Failed to log out. Please try again.", "error");
      }
    });
  }

  // FIX: this previously matched `pathname === item.href ||
  // pathname.startsWith(item.href + "/")`. For the "Dashboard" item
  // (href "/admin"), *every* nested admin route (`/admin/projects`,
  // `/admin/profile`, ...) starts with "/admin/", so "Dashboard" showed
  // as the active nav item on literally every admin page, not just the
  // dashboard itself. Segment-aware matching: exact match, or the next
  // path segment boundary, and only for genuinely nested items.
  function isActive(href: string): boolean {
    if (pathname === href) return true;
    if (href === "/admin") return false;
    return pathname.startsWith(`${href}/`);
  }

  const navContent = (
    <>
      <nav className="mt-8 flex flex-col gap-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dim">
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-sm px-2.5 py-1.5 font-body text-sm transition-colors ${
                        active
                          ? "bg-accent/10 text-accent"
                          : "text-muted hover:bg-border/40 hover:text-text"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-10 border-t border-border pt-4">
        <p className="font-mono text-xs text-dim">{user.email}</p>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          className="mt-2 font-mono text-xs text-muted underline underline-offset-4 transition-colors hover:text-accent disabled:opacity-50"
        >
          {isPending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-dvh bg-bg text-text lg:grid lg:grid-cols-[240px_1fr]">
      <div className="flex items-center justify-between border-b border-border bg-panel px-5 py-4 lg:hidden">
        <Link href="/admin" className="font-display text-lg tracking-tight text-text">
          engineering<span className="text-accent">.</span>console
        </Link>
        <button
          type="button"
          onClick={() => setMobileNavOpen((open) => !open)}
          aria-expanded={mobileNavOpen}
          aria-controls="admin-mobile-nav"
          aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          className="border border-border px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent"
        >
          {mobileNavOpen ? "Close" : "Menu"}
        </button>
      </div>

      <aside
        id="admin-mobile-nav"
        className={`${
          mobileNavOpen ? "block" : "hidden"
        } border-b border-border bg-panel px-5 py-6 lg:sticky lg:top-0 lg:block lg:h-dvh lg:overflow-y-auto lg:border-b-0 lg:border-r`}
      >
        <Link href="/admin" className="hidden font-display text-lg tracking-tight text-text lg:block">
          engineering<span className="text-accent">.</span>console
        </Link>
        {navContent}
      </aside>

      <main className="px-6 py-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
