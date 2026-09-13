import { boolean, index, integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { idColumn, timestampColumns } from "./columns.helpers";

// Reusable technology catalog, linked to projects, experiences, skills, and
// learning topics via junction tables. This is what keeps technologies from
// ever being stored as a comma-separated string.
export const technologies = pgTable(
  "technologies",
  {
    ...idColumn,
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    icon: text("icon"),
    category: text("category"),
    featured: boolean("featured").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("technologies_slug_idx").on(table.slug),
    index("technologies_category_idx").on(table.category),
  ],
);
