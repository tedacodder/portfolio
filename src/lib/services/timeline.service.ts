import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { timeline } from "@/db/schema";
import { NotFoundError } from "../errors/app-error";
import type { CreateTimelineEntryInput, UpdateTimelineEntryInput } from "../validation/timeline";

export async function listTimeline() {
  return db.select().from(timeline).orderBy(asc(timeline.displayOrder), asc(timeline.date));
}

export async function getTimelineEntryById(id: string) {
  const [row] = await db.select().from(timeline).where(eq(timeline.id, id)).limit(1);
  if (!row) throw new NotFoundError("Timeline entry");
  return row;
}

export async function createTimelineEntry(input: CreateTimelineEntryInput) {
  const [created] = await db.insert(timeline).values(input).returning();
  return created;
}

export async function updateTimelineEntry(id: string, input: UpdateTimelineEntryInput) {
  await getTimelineEntryById(id);
  const [updated] = await db
    .update(timeline)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(timeline.id, id))
    .returning();
  return updated;
}

export async function deleteTimelineEntry(id: string) {
  await getTimelineEntryById(id);
  await db.delete(timeline).where(eq(timeline.id, id));
}
