import { timestamp, uuid } from "drizzle-orm/pg-core";

// Every table in this schema shares these three columns. Centralizing them
// keeps the "id / created_at / updated_at on every table" requirement
// consistent and avoids copy-paste drift (e.g. one table forgetting
// `withTimezone`).
export const idColumn = {
  id: uuid("id").primaryKey().defaultRandom(),
};

export const timestampColumns = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};
