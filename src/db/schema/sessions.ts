import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { idColumn } from "./columns.helpers";
import { users } from "./users";

// Database-backed sessions rather than stateless JWTs. This lets us revoke
// a session immediately (logout, password change, admin deactivation)
// without waiting for token expiry, at the cost of a lookup per request —
// an acceptable trade-off for an admin-only auth surface with low traffic.
export const sessions = pgTable(
  "sessions",
  {
    ...idColumn,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Every authenticated request looks up the session by user; every
    // sweep for expired sessions filters by expiresAt.
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);
