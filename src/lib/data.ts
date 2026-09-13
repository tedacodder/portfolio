import "server-only";

import {
  mapProfile,
  mapPrinciple,
  mapTechnology,
  mapProject,
  mapExperience,
  mapEducation,
  mapLearningTopic,
  mapArticle,
  mapAchievement,
  mapSocialLink,
} from "@/lib/api/mappers";
import { getProfileOrNull } from "@/lib/services/profile.service";
import { listPrinciples } from "@/lib/services/principles.service";
import {
  listProjects,
  getProjectBySlug as getProjectBySlugRow,
  getProjectArchitecture,
} from "@/lib/services/projects.service";
import { listExperiences } from "@/lib/services/experiences.service";
import { listEducation } from "@/lib/services/education.service";
import { listTechnologies, attachProficiency } from "@/lib/services/technologies.service";
import { listLearningTopics } from "@/lib/services/learning.service";
import { listArticles, getArticleBySlug as getArticleBySlugRow } from "@/lib/services/articles.service";
import { listAchievements } from "@/lib/services/achievements.service";
import { listSocialLinks } from "@/lib/services/social-links.service";
import type { RawArticleRow, RawTechnology } from "@/types/backend-raw";
import type {
  Profile,
  Principle,
  Project,
  Experience,
  Education,
  Technology,
  LearningTopic,
  Article,
  Achievement,
  SocialLink,
  ActivitySummary,
} from "@/types/api";

// Server-only data access for Server Components (layouts, pages, sitemap).
//
// The `import "server-only"` above makes it a build-time error for any
// Client Component to end up importing this file (directly, or transitively
// through something it imports) — it fails fast at compile time instead of
// pulling the `postgres` driver (and Node built-ins like `fs`/`net`/`tls` it
// needs) into a browser bundle, which is not something a bundler error
// message makes obvious to track back to its source.
//
// This calls the same DB service functions each API route handler uses,
// directly — no self-fetch to this app's own "/api/..." routes. A Server
// Component fetching its own API has no real request context to resolve a
// relative URL against during `next build`'s static generation, which used
// to hang the build on every statically rendered page. Calling the service
// layer directly skips that HTTP round-trip entirely, at build time and at
// request time alike.
//
// The contact form is the one piece of data flow that's genuinely
// client-side (`submitContactForm`, still self-fetching `/api/contact` via
// `@/lib/api`) — that one's fine, since a real browser resolves a relative
// URL against the page it's on.
//
// Every function below returns `null`/`[]` on a failed or "not found" fetch
// rather than throwing, so pages can render graceful empty/error states
// instead of crashing.

const DEFAULT_LIST_PAGINATION = { page: 1, limit: 100 };

// `articles.published_at` is a real Postgres `timestamp` column, so Drizzle
// returns a `Date` object here — unlike the plain Postgres `date` columns
// used elsewhere (projects/experiences/education start & end dates, etc.),
// which Drizzle already returns as plain strings. `RawArticle` describes the
// JSON-over-HTTP shape (where `JSON.stringify` turns a `Date` into an ISO
// string); this converts a direct DB row into that same shape before handing
// it to `mapArticle`, so behavior matches what the old self-fetch produced.
function toRawArticle(row: RawArticleRow) {
  return { ...row, publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null };
}

export async function getProfile(): Promise<Profile | null> {
  try {
    const row = await getProfileOrNull();
    return row ? mapProfile(row) : null;
  } catch {
    return null;
  }
}

export async function getPrinciples(): Promise<Principle[]> {
  try {
    const rows = await listPrinciples();
    return rows.map(mapPrinciple);
  } catch {
    return [];
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const { rows } = await listProjects(DEFAULT_LIST_PAGINATION, { status: "PUBLISHED" });
    return rows.map(mapProject);
  } catch {
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const project = await getProjectBySlugRow(slug, { onlyPublished: true });
    const architecture = await getProjectArchitecture(project.id);
    return mapProject({ ...project, architecture });
  } catch {
    return null;
  }
}

export async function getExperiences(): Promise<Experience[]> {
  try {
    const rows = await listExperiences();
    return rows.map(mapExperience);
  } catch {
    return [];
  }
}

export async function getEducation(): Promise<Education[]> {
  try {
    const rows = await listEducation();
    return rows.map(mapEducation);
  } catch {
    return [];
  }
}

export async function getTechnologies(): Promise<Technology[]> {
  try {
    const { rows } = await listTechnologies(DEFAULT_LIST_PAGINATION, {});
    const withProficiency = await attachProficiency(rows);
    return withProficiency.map((row) => mapTechnology(row as RawTechnology));
  } catch {
    return [];
  }
}

export async function getLearningTopics(): Promise<LearningTopic[]> {
  try {
    const rows = await listLearningTopics({});
    return rows.map(mapLearningTopic);
  } catch {
    return [];
  }
}

export async function getArticles(): Promise<Article[]> {
  try {
    const { rows } = await listArticles(DEFAULT_LIST_PAGINATION, { status: "PUBLISHED" });
    return rows.map((row) => mapArticle(toRawArticle(row as RawArticleRow)));
  } catch {
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const row = await getArticleBySlugRow(slug, { onlyPublished: true });
    return mapArticle(toRawArticle(row as RawArticleRow));
  } catch {
    return null;
  }
}

export async function getAchievements(): Promise<Achievement[]> {
  try {
    const rows = await listAchievements();
    return rows.map(mapAchievement);
  } catch {
    return [];
  }
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const rows = await listSocialLinks({ onlyVisible: true });
    return rows.map(mapSocialLink);
  } catch {
    return [];
  }
}

// No real activity data source exists yet (see project decision: keep
// disabled rather than fabricate GitHub stats). This function is the single
// seam a future real integration would replace — everything downstream
// (ActivityVisualization) already renders its empty state off `hasData`.
export async function getActivity(): Promise<ActivitySummary> {
  return { hasData: false };
}
