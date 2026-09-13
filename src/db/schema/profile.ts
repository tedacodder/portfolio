import { pgTable, text } from "drizzle-orm/pg-core";
import { idColumn, timestampColumns } from "./columns.helpers";

// Singleton-style table: in practice only one row will ever exist (the
// portfolio owner), but modeling it as a real table with a UUID id — rather
// than a set of global config keys — keeps it consistent with the rest of
// the schema and makes future multi-profile use (unlikely, but possible)
// trivial rather than a rewrite. The service layer enforces "one row" by
// always upserting the first row rather than exposing a create-many API.
export const profile = pgTable("profile", {
  ...idColumn,
  name: text("name").notNull(),
  headline: text("headline").notNull(),
  shortBio: text("short_bio").notNull(),
  longBio: text("long_bio"),
  location: text("location"),
  availabilityStatus: text("availability_status"),
  profileImageUrl: text("profile_image_url"),
  resumeUrl: text("resume_url"),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  email: text("email").notNull(),
  websiteUrl: text("website_url"),
  ...timestampColumns,
});
