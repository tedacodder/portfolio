import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { learningTopics, learningTopicTechnologies, technologies } from "@/db/schema";
import { NotFoundError } from "../errors/app-error";
import type { CreateLearningTopicInput, UpdateLearningTopicInput } from "../validation/learning";

async function attachTechnologies(rows: (typeof learningTopics.$inferSelect)[]) {
  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return [];

  const links = await db
    .select({ topicId: learningTopicTechnologies.learningTopicId, technology: technologies })
    .from(learningTopicTechnologies)
    .innerJoin(technologies, eq(learningTopicTechnologies.technologyId, technologies.id))
    .where(inArray(learningTopicTechnologies.learningTopicId, ids));

  return rows.map((row) => ({
    ...row,
    technologies: links.filter((l) => l.topicId === row.id).map((l) => l.technology),
  }));
}

export async function listLearningTopics(filters: { status?: string }) {
  const where = filters.status
    ? eq(learningTopics.status, filters.status as (typeof learningTopics.$inferSelect)["status"])
    : undefined;
  const rows = await db
    .select()
    .from(learningTopics)
    .where(where)
    .orderBy(asc(learningTopics.displayOrder), asc(learningTopics.topic));
  return attachTechnologies(rows);
}

export async function getLearningTopicById(id: string) {
  const [row] = await db.select().from(learningTopics).where(eq(learningTopics.id, id)).limit(1);
  if (!row) throw new NotFoundError("Learning topic");
  const [withTech] = await attachTechnologies([row]);
  return withTech;
}

export async function createLearningTopic(input: CreateLearningTopicInput) {
  const { technologyIds, ...rest } = input;
  return db.transaction(async (tx) => {
    const [created] = await tx.insert(learningTopics).values(rest).returning();
    if (!created) throw new Error("Failed to create learning topic");
    if (technologyIds && technologyIds.length > 0) {
      await tx.insert(learningTopicTechnologies).values(
        technologyIds.map((technologyId) => ({ learningTopicId: created.id, technologyId })),
      );
    }
    return created;
  });
}

export async function updateLearningTopic(id: string, input: UpdateLearningTopicInput) {
  await getLearningTopicById(id);
  const { technologyIds, ...rest } = input;

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(learningTopics)
      .set({ ...rest, updatedAt: new Date() })
      .where(eq(learningTopics.id, id))
      .returning();

    if (technologyIds) {
      await tx.delete(learningTopicTechnologies).where(eq(learningTopicTechnologies.learningTopicId, id));
      if (technologyIds.length > 0) {
        await tx.insert(learningTopicTechnologies).values(
          technologyIds.map((technologyId) => ({ learningTopicId: id, technologyId })),
        );
      }
    }

    return updated;
  });
}

export async function deleteLearningTopic(id: string) {
  await getLearningTopicById(id);
  await db.delete(learningTopics).where(eq(learningTopics.id, id));
}
