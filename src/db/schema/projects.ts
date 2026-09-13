import { boolean, date, index, integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { idColumn, timestampColumns } from "./columns.helpers";
import { projectStatusEnum } from "./enums";

export const projects = pgTable(
  "projects",
  {
    ...idColumn,
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    shortDescription: text("short_description").notNull(),
    description: text("description"),
    problem: text("problem"),
    solution: text("solution"),
    featured: boolean("featured").notNull().default(false),
    status: projectStatusEnum("status").notNull().default("DRAFT"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    githubUrl: text("github_url"),
    liveUrl: text("live_url"),
    // Added during frontend/backend merge: every other content type
    // (articles, achievements, certifications, profile) already has an
    // image column; projects — the primary showcase content — did not,
    // even though the existing premium UI has cover-image display built
    // in. Mirrors the same `text` column pattern as the others.
    coverImageUrl: text("cover_image_url"),
    architectureDescription: text("architecture_description"),
    displayOrder: integer("display_order").notNull().default(0),
    ...timestampColumns,
  },
  (table) => [
    // Slugs power public lookups (`/api/projects/:slug`) and must be unique.
    uniqueIndex("projects_slug_idx").on(table.slug),
    // The public list endpoint always filters `status = PUBLISHED`.
    index("projects_status_idx").on(table.status),
    // The homepage "featured projects" section filters on this.
    index("projects_featured_idx").on(table.featured),
  ],
);
