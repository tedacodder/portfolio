import { index, integer, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { idColumn, timestampColumns } from "./columns.helpers";
import { technologies } from "./technologies";

// `proficiency` is an integer 0-100 rather than a vague enum ("Beginner /
// Intermediate / Advanced") because the frontend design calls for a skill
// bar/level indicator. It is treated as a deliberately coarse, self-rated
// signal for display purposes — not a precise measurement — and the admin
// UI/README should present it as such rather than implying benchmarking.
export const skills = pgTable(
  "skills",
  {
    ...idColumn,
    name: text("name").notNull(),
    category: text("category").notNull(),
    description: text("description"),
    proficiency: integer("proficiency"),
    displayOrder: integer("display_order").notNull().default(0),
    ...timestampColumns,
  },
  (table) => [index("skills_category_idx").on(table.category)],
);

// Optional link from a skill to a concrete technology in the catalog (e.g.
// the "Backend" skill entry "Go" can point at the "Go" technology row so
// icons/links stay in sync). Nullable because not every skill maps to a
// single reusable technology (e.g. "System Design").
export const skillTechnologies = pgTable(
  "skill_technologies",
  {
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    technologyId: uuid("technology_id")
      .notNull()
      .references(() => technologies.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.skillId, table.technologyId] })],
);
