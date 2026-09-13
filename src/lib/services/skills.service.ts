import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { skillTechnologies, skills, technologies } from "@/db/schema";
import { NotFoundError } from "../errors/app-error";
import type { CreateSkillInput, UpdateSkillInput } from "../validation/skills";

async function attachTechnology(rows: (typeof skills.$inferSelect)[]) {
  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return [];

  const links = await db
    .select({ skillId: skillTechnologies.skillId, technology: technologies })
    .from(skillTechnologies)
    .innerJoin(technologies, eq(skillTechnologies.technologyId, technologies.id))
    .where(inArray(skillTechnologies.skillId, ids));

  return rows.map((row) => ({
    ...row,
    technology: links.find((l) => l.skillId === row.id)?.technology ?? null,
  }));
}

export async function listSkills(filters: { category?: string }) {
  const where = filters.category ? eq(skills.category, filters.category) : undefined;
  const rows = await db.select().from(skills).where(where).orderBy(asc(skills.displayOrder), asc(skills.name));
  return attachTechnology(rows);
}

export async function getSkillById(id: string) {
  const [row] = await db.select().from(skills).where(eq(skills.id, id)).limit(1);
  if (!row) throw new NotFoundError("Skill");
  const [withTech] = await attachTechnology([row]);
  return withTech;
}

export async function createSkill(input: CreateSkillInput) {
  const { technologyId, ...rest } = input;
  return db.transaction(async (tx) => {
    const [created] = await tx.insert(skills).values(rest).returning();
    if (!created) throw new Error("Failed to create skill");
    if (technologyId) {
      await tx.insert(skillTechnologies).values({ skillId: created.id, technologyId });
    }
    return created;
  });
}

export async function updateSkill(id: string, input: UpdateSkillInput) {
  await getSkillById(id);
  const { technologyId, ...rest } = input;

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(skills)
      .set({ ...rest, updatedAt: new Date() })
      .where(eq(skills.id, id))
      .returning();

    if (technologyId !== undefined) {
      await tx.delete(skillTechnologies).where(eq(skillTechnologies.skillId, id));
      if (technologyId) {
        await tx.insert(skillTechnologies).values({ skillId: id, technologyId });
      }
    }

    return updated;
  });
}

export async function deleteSkill(id: string) {
  await getSkillById(id);
  await db.delete(skills).where(eq(skills.id, id));
}
