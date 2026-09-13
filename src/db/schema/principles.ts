import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { idColumn, timestampColumns } from "./columns.helpers";

// Small standalone resource for the "About / Principles" section. Kept
// deliberately simple (no junction tables) — mirrors the shape of
// `timeline`/`achievements`: a flat, orderable list of cards.
export const principles = pgTable("principles", {
  ...idColumn,
  title: text("title").notNull(),
  description: text("description").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  ...timestampColumns,
});
