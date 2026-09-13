import { afterAll, beforeAll, describe, expect, it } from "vitest";

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)("articles (integration)", () => {
  let db: typeof import("@/db").db;
  let schema: typeof import("@/db/schema");
  let eq: typeof import("drizzle-orm").eq;
  let createArticle: typeof import("@/lib/services/articles.service").createArticle;
  let updateArticle: typeof import("@/lib/services/articles.service").updateArticle;
  let getArticleBySlug: typeof import("@/lib/services/articles.service").getArticleBySlug;
  let NotFoundError: typeof import("@/lib/errors/app-error").NotFoundError;

  const slugBase = `test-article-${Date.now()}`;
  let createdId: string;

  beforeAll(async () => {
    ({ db } = await import("@/db"));
    schema = await import("@/db/schema");
    ({ eq } = await import("drizzle-orm"));
    ({ createArticle, updateArticle, getArticleBySlug } = await import("@/lib/services/articles.service"));
    ({ NotFoundError } = await import("@/lib/errors/app-error"));
  });

  afterAll(async () => {
    await db.delete(schema.articles).where(eq(schema.articles.slug, slugBase));
  });

  it("creates a DRAFT article", async () => {
    const created = await createArticle({
      title: slugBase,
      content: "Draft content",
      status: "DRAFT",
      featured: false,
      coverImageUrl: undefined,
    });
    createdId = created!.id;
    expect(created!.status).toBe("DRAFT");
    expect(created!.publishedAt).toBeNull();
  });

  it("is not visible via the public published-only slug lookup while DRAFT", async () => {
    await expect(getArticleBySlug(slugBase, { onlyPublished: true })).rejects.toThrow(NotFoundError);
  });

  it("stamps publishedAt on first publish", async () => {
    const updated = await updateArticle(createdId, { status: "PUBLISHED" });
    expect(updated!.status).toBe("PUBLISHED");
    expect(updated!.publishedAt).not.toBeNull();
  });

  it("is now visible via the public published-only slug lookup", async () => {
    const found = await getArticleBySlug(slugBase, { onlyPublished: true });
    expect(found.id).toBe(createdId);
  });
});
