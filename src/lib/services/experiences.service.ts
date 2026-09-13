import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { experienceHighlights, experiences, experienceTechnologies, technologies } from "@/db/schema";
import { NotFoundError } from "../errors/app-error";
import type { CreateExperienceInput, UpdateExperienceInput } from "../validation/experiences";

async function attachRelations(rows: (typeof experiences.$inferSelect)[]) {
  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return [];

  const [highlights, techRows] = await Promise.all([
    db
      .select()
      .from(experienceHighlights)
      .where(inArray(experienceHighlights.experienceId, ids))
      .orderBy(asc(experienceHighlights.displayOrder)),
    db
      .select({ experienceId: experienceTechnologies.experienceId, technology: technologies })
      .from(experienceTechnologies)
      .innerJoin(technologies, eq(experienceTechnologies.technologyId, technologies.id))
      .where(inArray(experienceTechnologies.experienceId, ids)),
  ]);

  return rows.map((row) => ({
    ...row,
    highlights: highlights.filter((h) => h.experienceId === row.id),
    technologies: techRows.filter((t) => t.experienceId === row.id).map((t) => t.technology),
  }));
}

export async function listExperiences() {
  const rows = await db.select().from(experiences).orderBy(asc(experiences.displayOrder), asc(experiences.startDate));
  return attachRelations(rows);
}

export async function getExperienceById(id: string) {
  const [row] = await db.select().from(experiences).where(eq(experiences.id, id)).limit(1);
  if (!row) throw new NotFoundError("Experience");
  const [withRelations] = await attachRelations([row]);
  return withRelations;
}

async function setHighlightsAndTech(
  tx: typeof db,
  experienceId: string,
  highlights?: string[],
  technologyIds?: string[],
) {
  if (highlights) {
    await tx.delete(experienceHighlights).where(eq(experienceHighlights.experienceId, experienceId));
    if (highlights.length > 0) {
      await tx.insert(experienceHighlights).values(
        highlights.map((content, index) => ({ experienceId, content, displayOrder: index })),
      );
    }
  }

  if (technologyIds) {
    await tx.delete(experienceTechnologies).where(eq(experienceTechnologies.experienceId, experienceId));
    if (technologyIds.length > 0) {
      await tx.insert(experienceTechnologies).values(
        technologyIds.map((technologyId) => ({ experienceId, technologyId })),
      );
    }
  }
}

export async function createExperience(input: CreateExperienceInput) {
  const { highlights, technologyIds, ...rest } = input;

  return db.transaction(async (tx) => {
    const [created] = await tx.insert(experiences).values(rest).returning();
    if (!created) throw new Error("Failed to create experience");
    await setHighlightsAndTech(tx as unknown as typeof db, created.id, highlights, technologyIds);
    return created;
  });
}

export async function updateExperience(id: string, input: UpdateExperienceInput) {
  await getExperienceById(id);
  const { highlights, technologyIds, ...rest } = input;

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(experiences)
      .set({ ...rest, updatedAt: new Date() })
      .where(eq(experiences.id, id))
      .returning();
    await setHighlightsAndTech(tx as unknown as typeof db, id, highlights, technologyIds);
    return updated;
  });
}

export async function deleteExperience(id: string) {
  await getExperienceById(id);
  await db.delete(experiences).where(eq(experiences.id, id));
}
