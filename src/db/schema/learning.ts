import { date, index, integer, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { idColumn, timestampColumns } from "./columns.helpers";
import { learningStatusEnum } from "./enums";
import { technologies } from "./technologies";

export const learningTopics = pgTable(
  "learning_topics",
  {
    ...idColumn,
    topic: text("topic").notNull(),
    description: text("description"),
    // 0-100, deliberately coarse self-reported progress — same rationale as
    // skills.proficiency.
    progress: integer("progress").notNull().default(0),
    status: learningStatusEnum("status").notNull().default("PLANNED"),
    displayOrder: integer("display_order").notNull().default(0),
    startedAt: date("started_at"),
    targetDate: date("target_date"),
    ...timestampColumns,
  },
  (table) => [index("learning_topics_status_idx").on(table.status)],
);

export const learningTopicTechnologies = pgTable(
  "learning_topic_technologies",
  {
    learningTopicId: uuid("learning_topic_id")
      .notNull()
      .references(() => learningTopics.id, { onDelete: "cascade" }),
    technologyId: uuid("technology_id")
      .notNull()
      .references(() => technologies.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.learningTopicId, table.technologyId] })],
);
