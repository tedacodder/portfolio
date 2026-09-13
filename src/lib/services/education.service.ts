import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { education } from "@/db/schema";
import { NotFoundError } from "../errors/app-error";
import type { CreateEducationInput, UpdateEducationInput } from "../validation/education";

export async function listEducation() {
  return db.select().from(education).orderBy(asc(education.displayOrder), asc(education.startDate));
}

export async function getEducationById(id: string) {
  const [row] = await db.select().from(education).where(eq(education.id, id)).limit(1);
  if (!row) throw new NotFoundError("Education entry");
  return row;
}

export async function createEducation(input: CreateEducationInput) {
  const [created] = await db.insert(education).values(input).returning();
  return created;
}

export async function updateEducation(id: string, input: UpdateEducationInput) {
  await getEducationById(id);
  const [updated] = await db
    .update(education)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(education.id, id))
    .returning();
  return updated;
}

export async function deleteEducation(id: string) {
  await getEducationById(id);
  await db.delete(education).where(eq(education.id, id));
}
