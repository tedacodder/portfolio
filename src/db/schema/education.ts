import { boolean, date, index, integer, pgTable, text } from "drizzle-orm/pg-core";
import { idColumn, timestampColumns } from "./columns.helpers";

export const education = pgTable(
  "education",
  {
    ...idColumn,
    institution: text("institution").notNull(),
    degree: text("degree").notNull(),
    fieldOfStudy: text("field_of_study"),
    description: text("description"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    current: boolean("current").notNull().default(false),
    location: text("location"),
    url: text("url"),
    displayOrder: integer("display_order").notNull().default(0),
    ...timestampColumns,
  },
  (table) => [index("education_start_date_idx").on(table.startDate)],
);
