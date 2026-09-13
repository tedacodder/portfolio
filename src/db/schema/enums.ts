import { pgEnum } from "drizzle-orm/pg-core";

// Centralized Postgres enum definitions. Keeping these in one file makes it
// obvious which enums exist and prevents accidental duplicate definitions
// across schema files.

export const userRoleEnum = pgEnum("user_role", ["ADMIN"]);

export const projectStatusEnum = pgEnum("project_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const articleStatusEnum = pgEnum("article_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const learningStatusEnum = pgEnum("learning_status", [
  "PLANNED",
  "LEARNING",
  "PAUSED",
  "COMPLETED",
]);

export const employmentTypeEnum = pgEnum("employment_type", [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "FREELANCE",
]);

export const contactStatusEnum = pgEnum("contact_status", [
  "UNREAD",
  "READ",
  "ARCHIVED",
]);

export const architectureNodeTypeEnum = pgEnum("architecture_node_type", [
  "SERVICE",
  "DATABASE",
  "QUEUE",
  "CACHE",
  "CLIENT",
  "EXTERNAL",
  "GATEWAY",
  "STORAGE",
]);
