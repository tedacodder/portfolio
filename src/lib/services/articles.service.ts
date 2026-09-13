import { and, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { articleTags, articles, tags } from "@/db/schema";
import { ConflictError, NotFoundError } from "../errors/app-error";
import { generateUniqueSlug, slugify } from "../utils/slug";
import { toOffset, type PaginationQuery } from "../validation/pagination";
import type { CreateArticleInput, UpdateArticleInput } from "../validation/articles";

interface ListFilters {
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured?: boolean;
  tag?: string;
}

async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const [row] = await db.select({ id: articles.id }).from(articles).where(eq(articles.slug, slug)).limit(1);
  return Boolean(row && row.id !== excludeId);
}

async function attachTags(rows: (typeof articles.$inferSelect)[]) {
  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return [];

  const links = await db
    .select({ articleId: articleTags.articleId, tag: tags })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(inArray(articleTags.articleId, ids));

  return rows.map((row) => ({
    ...row,
    tags: links.filter((l) => l.articleId === row.id).map((l) => l.tag),
  }));
}

/** Finds-or-creates each tag by name (slugified) and returns their ids. */
async function resolveTagIds(tx: typeof db, tagNames: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const name of tagNames) {
    const slug = slugify(name);
    if (!slug) continue;

    const [existing] = await tx.select().from(tags).where(eq(tags.slug, slug)).limit(1);
    if (existing) {
      ids.push(existing.id);
      continue;
    }

    const [created] = await tx.insert(tags).values({ name, slug }).returning();
    if (created) ids.push(created.id);
  }
  return ids;
}

export async function listArticles(pagination: PaginationQuery, filters: ListFilters) {
  let articleIdsForTag: string[] | undefined;
  if (filters.tag) {
    const tagSlug = slugify(filters.tag);
    const rows = await db
      .select({ articleId: articleTags.articleId })
      .from(articleTags)
      .innerJoin(tags, eq(articleTags.tagId, tags.id))
      .where(eq(tags.slug, tagSlug));
    articleIdsForTag = rows.map((r) => r.articleId);
    if (articleIdsForTag.length === 0) {
      return { rows: [], total: 0 };
    }
  }

  const conditions = [
    filters.status ? eq(articles.status, filters.status) : undefined,
    filters.featured !== undefined ? eq(articles.featured, filters.featured) : undefined,
    articleIdsForTag ? inArray(articles.id, articleIdsForTag) : undefined,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined);
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(articles)
      .where(where)
      .orderBy(desc(articles.publishedAt), desc(articles.createdAt))
      .limit(pagination.limit)
      .offset(toOffset(pagination.page, pagination.limit)),
    db.select({ value: count() }).from(articles).where(where),
  ]);

  return { rows: await attachTags(rows), total: totalResult[0]?.value ?? 0 };
}

export async function getArticleById(id: string) {
  const [row] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  if (!row) throw new NotFoundError("Article");
  const [withTags] = await attachTags([row]);
  return withTags;
}

export async function getArticleBySlug(slug: string, { onlyPublished }: { onlyPublished: boolean }) {
  const conditions = onlyPublished
    ? and(eq(articles.slug, slug), eq(articles.status, "PUBLISHED"))
    : eq(articles.slug, slug);

  const [row] = await db.select().from(articles).where(conditions).limit(1);
  if (!row) throw new NotFoundError("Article");
  const [withTags] = await attachTags([row]);
  return withTags;
}

export async function createArticle(input: CreateArticleInput) {
  const { tags: tagNames, ...rest } = input;

  let resolvedSlug: string;
  if (rest.slug) {
    if (await isSlugTaken(rest.slug)) throw new ConflictError("Slug already in use");
    resolvedSlug = rest.slug;
  } else {
    resolvedSlug = await generateUniqueSlug(rest.title, (candidate) => isSlugTaken(candidate));
  }

  // Publishing sets publishedAt automatically if not already set.
  const publishedAt = rest.status === "PUBLISHED" ? new Date() : undefined;

  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(articles)
      .values({ ...rest, slug: resolvedSlug, publishedAt })
      .returning();
    if (!created) throw new Error("Failed to create article");

    if (tagNames && tagNames.length > 0) {
      const tagIds = await resolveTagIds(tx as unknown as typeof db, tagNames);
      if (tagIds.length > 0) {
        await tx.insert(articleTags).values(tagIds.map((tagId) => ({ articleId: created.id, tagId })));
      }
    }

    return created;
  });
}

export async function updateArticle(id: string, input: UpdateArticleInput) {
  const existing = await getArticleById(id);
  const { tags: tagNames, ...rest } = input;

  if (rest.slug && (await isSlugTaken(rest.slug, id))) {
    throw new ConflictError("Slug already in use");
  }

  // If the update transitions status into PUBLISHED and there's no
  // publishedAt yet, stamp it now (first publish). Re-publishing an
  // already-published article does not reset the original publish date.
  const publishedAt =
    rest.status === "PUBLISHED" && !existing.publishedAt ? new Date() : undefined;

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(articles)
      .set({ ...rest, ...(publishedAt ? { publishedAt } : {}), updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();

    if (tagNames) {
      await tx.delete(articleTags).where(eq(articleTags.articleId, id));
      const tagIds = await resolveTagIds(tx as unknown as typeof db, tagNames);
      if (tagIds.length > 0) {
        await tx.insert(articleTags).values(tagIds.map((tagId) => ({ articleId: id, tagId })));
      }
    }

    return updated;
  });
}

export async function deleteArticle(id: string) {
  await getArticleById(id);
  await db.delete(articles).where(eq(articles.id, id));
}
