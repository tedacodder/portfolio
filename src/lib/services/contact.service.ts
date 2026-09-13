import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { NotFoundError } from "../errors/app-error";
import { toOffset, type PaginationQuery } from "../validation/pagination";
import type { CreateContactMessageInput } from "../validation/contact";

export async function submitContactMessage(input: Omit<CreateContactMessageInput, "website">) {
  const [created] = await db.insert(contactMessages).values(input).returning();
  return created;
}

export async function listContactMessages(
  pagination: PaginationQuery,
  filters: { status?: "UNREAD" | "READ" | "ARCHIVED" },
) {
  const where = filters.status ? eq(contactMessages.status, filters.status) : undefined;

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(contactMessages)
      .where(where)
      .orderBy(desc(contactMessages.createdAt))
      .limit(pagination.limit)
      .offset(toOffset(pagination.page, pagination.limit)),
    db.select({ value: count() }).from(contactMessages).where(where),
  ]);

  return { rows, total: totalResult[0]?.value ?? 0 };
}

export async function getContactMessageById(id: string) {
  const [row] = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
  if (!row) throw new NotFoundError("Contact message");
  return row;
}

export async function updateContactMessageStatus(id: string, status: "UNREAD" | "READ" | "ARCHIVED") {
  await getContactMessageById(id);
  const readAt = status === "READ" ? new Date() : undefined;

  const [updated] = await db
    .update(contactMessages)
    .set({ status, ...(readAt ? { readAt } : {}), updatedAt: new Date() })
    .where(eq(contactMessages.id, id))
    .returning();
  return updated;
}

export async function deleteContactMessage(id: string) {
  await getContactMessageById(id);
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
}
