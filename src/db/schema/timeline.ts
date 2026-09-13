import { date, index, integer, pgTable, text } from "drizzle-orm/pg-core";
import { idColumn, timestampColumns } from "./columns.helpers";

// `year_or_label` is a free-form text column (not an integer year) because
// the UI needs labels like "NOW" alongside literal years like "2024".
// `date` remains the sortable/filterable field for actual chronology.
export const timeline = pgTable(
  "timeline",
  {
    ...idColumn,
    yearOrLabel: text("year_or_label").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    date: date("date"),
    displayOrder: integer("display_order").notNull().default(0),
    ...timestampColumns,
  },
  (table) => [index("timeline_date_idx").on(table.date)],
);
