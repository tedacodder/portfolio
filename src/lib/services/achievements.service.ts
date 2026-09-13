import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { achievements } from "@/db/schema";
import { NotFoundError } from "../errors/app-error";
import type { CreateAchievementInput, UpdateAchievementInput } from "../validation/achievements";

export async function listAchievements() {
  return db.select().from(achievements).orderBy(asc(achievements.displayOrder), desc(achievements.date));
}

export async function getAchievementById(id: string) {
  const [row] = await db.select().from(achievements).where(eq(achievements.id, id)).limit(1);
  if (!row) throw new NotFoundError("Achievement");
  return row;
}

export async function createAchievement(input: CreateAchievementInput) {
  const [created] = await db.insert(achievements).values(input).returning();
  return created;
}

export async function updateAchievement(id: string, input: UpdateAchievementInput) {
  await getAchievementById(id);
  const [updated] = await db
    .update(achievements)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(achievements.id, id))
    .returning();
  return updated;
}

export async function deleteAchievement(id: string) {
  await getAchievementById(id);
  await db.delete(achievements).where(eq(achievements.id, id));
}
