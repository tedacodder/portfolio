import { date, index, pgTable, text } from "drizzle-orm/pg-core";
import { idColumn, timestampColumns } from "./columns.helpers";

export const certifications = pgTable(
  "certifications",
  {
    ...idColumn,
    name: text("name").notNull(),
    issuer: text("issuer").notNull(),
    credentialId: text("credential_id"),
    credentialUrl: text("credential_url"),
    issuedAt: date("issued_at"),
    expiresAt: date("expires_at"),
    imageUrl: text("image_url"),
    description: text("description"),
    ...timestampColumns,
  },
  (table) => [index("certifications_issued_at_idx").on(table.issuedAt)],
);
