import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";
import { idColumn, timestampColumns } from "./columns.helpers";

export const socialLinks = pgTable("social_links", {
  ...idColumn,
  platform: text("platform").notNull(),
  label: text("label"),
  url: text("url").notNull(),
  icon: text("icon"),
  displayOrder: integer("display_order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  ...timestampColumns,
});
