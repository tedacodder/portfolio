import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { technologies } from "./technologies";

// Many-to-many join table between projects and technologies. Composite
// primary key prevents duplicate (project, technology) pairs at the DB
// level, not just in application code.
export const projectTechnologies = pgTable(
  "project_technologies",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    technologyId: uuid("technology_id")
      .notNull()
      .references(() => technologies.id, { onDelete: "restrict" }),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.technologyId] }),
  ],
);
