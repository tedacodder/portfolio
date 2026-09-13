import { boolean, date, index, integer, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { idColumn, timestampColumns } from "./columns.helpers";
import { employmentTypeEnum } from "./enums";
import { technologies } from "./technologies";

export const experiences = pgTable(
  "experiences",
  {
    ...idColumn,
    company: text("company").notNull(),
    role: text("role").notNull(),
    employmentType: employmentTypeEnum("employment_type").notNull().default("FULL_TIME"),
    location: text("location"),
    description: text("description"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    current: boolean("current").notNull().default(false),
    companyUrl: text("company_url"),
    displayOrder: integer("display_order").notNull().default(0),
    ...timestampColumns,
  },
  (table) => [index("experiences_start_date_idx").on(table.startDate)],
);

// Responsibilities/achievements per experience are normalized into their
// own rows (one per bullet point) instead of one large text field, so each
// can be reordered, edited, or removed independently from the admin UI.
export const experienceHighlights = pgTable(
  "experience_highlights",
  {
    ...idColumn,
    experienceId: uuid("experience_id")
      .notNull()
      .references(() => experiences.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    displayOrder: integer("display_order").notNull().default(0),
    ...timestampColumns,
  },
  (table) => [index("experience_highlights_experience_id_idx").on(table.experienceId)],
);

// Technologies used in a given role, mirroring project_technologies.
export const experienceTechnologies = pgTable(
  "experience_technologies",
  {
    experienceId: uuid("experience_id")
      .notNull()
      .references(() => experiences.id, { onDelete: "cascade" }),
    technologyId: uuid("technology_id")
      .notNull()
      .references(() => technologies.id, { onDelete: "restrict" }),
  },
  (table) => [primaryKey({ columns: [table.experienceId, table.technologyId] })],
);
