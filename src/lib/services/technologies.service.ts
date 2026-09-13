import { and, asc, count, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { skillTechnologies, skills, technologies } from "@/db/schema";
import { NotFoundError, ConflictError } from "../errors/app-error";
import { generateUniqueSlug } from "../utils/slug";
import { toOffset, type PaginationQuery } from "../validation/pagination";
import type { CreateTechnologyInput, UpdateTechnologyInput } from "../validation/technologies";
import { isForeignKeyViolation } from "../utils/db-errors";

interface ListFilters {
  category?: string;
  featured?: boolean;
}

export async function listTechnologies(pagination: PaginationQuery, filters: ListFilters) {
  const conditions = [
    filters.category ? eq(technologies.category, filters.category) : undefined,
    filters.featured !== undefined ? eq(technologies.featured, filters.featured) : undefined,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined);

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(technologies)
      .where(where)
      .orderBy(asc(technologies.displayOrder), asc(technologies.name))
      .limit(pagination.limit)
      .offset(toOffset(pagination.page, pagination.limit)),
    db.select({ value: count() }).from(technologies).where(where),
  ]);

  return { rows, total: totalResult[0]?.value ?? 0 };
}

/**
 * Attaches a `proficiency` figure to each technology row, sourced from any
 * `skills` row linked to it via `skill_technologies` (proficiency lives on
 * `skills`, not `technologies` — see schema comment). When several skills
 * link to the same technology, the highest proficiency wins. Technologies
 * with no linked skill simply have no `proficiency` in the response — the
 * public technology constellation treats that as "unrated" rather than 0.
 */
export async function attachProficiency<T extends { id: string }>(
  rows: T[],
): Promise<(T & { proficiency?: number })[]> {
  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return rows;

  const links = await db
    .select({ technologyId: skillTechnologies.technologyId, proficiency: skills.proficiency })
    .from(skillTechnologies)
    .innerJoin(skills, eq(skillTechnologies.skillId, skills.id))
    .where(inArray(skillTechnologies.technologyId, ids));

  const best = new Map<string, number>();
  for (const link of links) {
    if (link.proficiency === null) continue;
    const current = best.get(link.technologyId);
    if (current === undefined || link.proficiency > current) {
      best.set(link.technologyId, link.proficiency);
    }
  }

  return rows.map((row) => {
    const proficiency = best.get(row.id);
    return proficiency === undefined ? row : { ...row, proficiency };
  });
}

export async function getTechnologyById(id: string) {
  const [row] = await db.select().from(technologies).where(eq(technologies.id, id)).limit(1);
  if (!row) throw new NotFoundError("Technology");
  return row;
}

async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const [row] = await db
    .select({ id: technologies.id })
    .from(technologies)
    .where(eq(technologies.slug, slug))
    .limit(1);
  return Boolean(row && row.id !== excludeId);
}

export async function createTechnology(input: CreateTechnologyInput) {
  let slug: string;

  if (input.slug) {
    if (await isSlugTaken(input.slug)) {
      throw new ConflictError("Slug already in use");
    }
    slug = input.slug;
  } else {
    slug = await generateUniqueSlug(input.name, (candidate) => isSlugTaken(candidate));
  }

  const [created] = await db
    .insert(technologies)
    .values({ ...input, slug })
    .returning();

  return created;
}

export async function updateTechnology(id: string, input: UpdateTechnologyInput) {
  await getTechnologyById(id);

  if (input.slug && (await isSlugTaken(input.slug, id))) {
    throw new ConflictError("Slug already in use");
  }

  const [updated] = await db
    .update(technologies)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(technologies.id, id))
    .returning();

  return updated;
}

export async function deleteTechnology(id: string) {
  await getTechnologyById(id);

  try {
    await db.delete(technologies).where(eq(technologies.id, id));
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      throw new ConflictError(
        "Cannot delete a technology that is still referenced by a project, experience, skill, or learning topic",
      );
    }
    throw error;
  }
}
