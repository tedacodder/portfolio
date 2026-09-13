import { boolean, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { idColumn, timestampColumns } from "./columns.helpers";
import { userRoleEnum } from "./enums";

// Admin/user accounts. Only ADMIN exists today, but `role` is an enum
// (rather than a boolean `isAdmin` flag) specifically so new roles can be
// added later without a breaking schema change.
export const users = pgTable(
  "users",
  {
    ...idColumn,
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: userRoleEnum("role").notNull().default("ADMIN"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    // Emails must be unique and are the login identifier, so they're
    // indexed for both the uniqueness constraint and fast login lookups.
    uniqueIndex("users_email_idx").on(table.email),
  ],
);
