import { date, index, integer, pgTable, text } from "drizzle-orm/pg-core";
import { idColumn, timestampColumns } from "./columns.helpers";

export const achievements = pgTable(
  "achievements",
  {
    ...idColumn,
    title: text("title").notNull(),
    description: text("description"),
    organization: text("organization"),
    date: date("date"),
    url: text("url"),
    imageUrl: text("image_url"),
    displayOrder: integer("display_order").notNull().default(0),
    ...timestampColumns,
  },
  (table) => [index("achievements_date_idx").on(table.date)],
);
