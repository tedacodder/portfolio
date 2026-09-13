import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { idColumn, timestampColumns } from "./columns.helpers";
import { contactStatusEnum } from "./enums";

export const contactMessages = pgTable(
  "contact_messages",
  {
    ...idColumn,
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject"),
    message: text("message").notNull(),
    status: contactStatusEnum("status").notNull().default("UNREAD"),
    readAt: timestamp("read_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [index("contact_messages_status_idx").on(table.status)],
);
