import Link from "next/link";
import { listProjects } from "@/lib/services/projects.service";
import { listArticles } from "@/lib/services/articles.service";
import { listContactMessages } from "@/lib/services/contact.service";
import { getProfileOrNull } from "@/lib/services/profile.service";

export const metadata = { robots: { index: false, follow: false } };

// FIX: this page used `Promise.all`, so a failure in *any one* of the four
// queries (e.g. a transient DB hiccup fetching unread contact-message
// count) threw the whole dashboard into the nearest error boundary and the
// person lost the projects/articles counts too, even though those queries
// had already succeeded. `Promise.allSettled` lets each stat card fail
// independently — exactly the "avoid making the entire dashboard unusable
// because one small API request fails" requirement.
export default async function AdminDashboardPage() {
  const [projectsResult, articlesResult, unreadMessagesResult, profileResult] = await Promise.allSettled([
    listProjects({ page: 1, limit: 1 }, {}),
    listArticles({ page: 1, limit: 1 }, {}),
    listContactMessages({ page: 1, limit: 1 }, { status: "UNREAD" }),
    getProfileOrNull(),
  ]);

  const cards = [
    {
      label: "Projects",
      value: projectsResult.status === "fulfilled" ? projectsResult.value.total : null,
      href: "/admin/projects",
    },
    {
      label: "Articles",
      value: articlesResult.status === "fulfilled" ? articlesResult.value.total : null,
      href: "/admin/articles",
    },
    {
      label: "Unread messages",
      value: unreadMessagesResult.status === "fulfilled" ? unreadMessagesResult.value.total : null,
      href: "/admin/contact",
    },
  ];

  const profile = profileResult.status === "fulfilled" ? profileResult.value : undefined;
  const profileFailed = profileResult.status === "rejected";

  return (
    <div>
      <h1 className="font-display text-2xl text-text">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">
        {profileFailed
          ? "Signed in. (Couldn't load your profile status right now.)"
          : profile
            ? `Signed in — managing ${profile.name}'s portfolio.`
            : "Welcome. Set up your profile to get started."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((card) =>
          card.value === null ? (
            <div
              key={card.label}
              className="border border-red-500/30 bg-red-500/5 p-6"
              role="alert"
            >
              <p className="font-mono text-xs text-red-400">Unable to load</p>
              <p className="mt-1 font-mono text-xs text-dim">{card.label.toUpperCase()}</p>
            </div>
          ) : (
            <Link
              key={card.label}
              href={card.href}
              className="border border-border p-6 transition-colors hover:border-accent"
            >
              <p className="font-display text-3xl text-text">{card.value}</p>
              <p className="mt-1 font-mono text-xs text-dim">{card.label.toUpperCase()}</p>
            </Link>
          ),
        )}
      </div>

      {!profileFailed && !profile && (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-text">Your public profile hasn&rsquo;t been set up yet.</p>
          <Link href="/admin/profile" className="mt-2 inline-block font-mono text-xs text-accent underline underline-offset-4">
            Set up profile →
          </Link>
        </div>
      )}
    </div>
  );
}
