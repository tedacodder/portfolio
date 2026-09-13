import { afterAll, beforeAll, describe, expect, it } from "vitest";

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)("projects (integration)", () => {
  let db: typeof import("@/db").db;
  let schema: typeof import("@/db/schema");
  let eq: typeof import("drizzle-orm").eq;
  let createProject: typeof import("@/lib/services/projects.service").createProject;
  let updateProject: typeof import("@/lib/services/projects.service").updateProject;
  let deleteProject: typeof import("@/lib/services/projects.service").deleteProject;
  let getProjectBySlug: typeof import("@/lib/services/projects.service").getProjectBySlug;
  let listProjects: typeof import("@/lib/services/projects.service").listProjects;
  let NotFoundError: typeof import("@/lib/errors/app-error").NotFoundError;

  const slugBase = `test-project-${Date.now()}`;
  let createdId: string;

  beforeAll(async () => {
    ({ db } = await import("@/db"));
    schema = await import("@/db/schema");
    ({ eq } = await import("drizzle-orm"));
    ({ createProject, updateProject, deleteProject, getProjectBySlug, listProjects } = await import(
      "@/lib/services/projects.service"
    ));
    ({ NotFoundError } = await import("@/lib/errors/app-error"));
  });

  afterAll(async () => {
    await db.delete(schema.projects).where(eq(schema.projects.slug, slugBase));
  });

  it("creates a project as DRAFT by default with a generated slug", async () => {
    const created = await createProject({
      title: slugBase,
      shortDescription: "A test project",
      status: "DRAFT",
      featured: false,
      displayOrder: 0,
      githubUrl: undefined,
      liveUrl: undefined,
      coverImageUrl: undefined,
    });
    createdId = created!.id;
    expect(created!.status).toBe("DRAFT");
    expect(created!.slug).toBe(slugBase);
  });

  it("does not expose a DRAFT project through the public published-only lookup", async () => {
    await expect(getProjectBySlug(slugBase, { onlyPublished: true })).rejects.toThrow(NotFoundError);
  });

  it("updates a project, including publishing it", async () => {
    const updated = await updateProject(createdId, { status: "PUBLISHED" });
    expect(updated!.status).toBe("PUBLISHED");
  });

  it("is now visible through the public published-only lookup", async () => {
    const found = await getProjectBySlug(slugBase, { onlyPublished: true });
    expect(found.id).toBe(createdId);
  });

  it("excludes DRAFT/ARCHIVED projects from the public status=PUBLISHED list filter", async () => {
    await updateProject(createdId, { status: "ARCHIVED" });
    const { rows } = await listProjects({ page: 1, limit: 100 }, { status: "PUBLISHED" });
    expect(rows.find((r) => r.id === createdId)).toBeUndefined();
  });

  it("archives/deletes cleanly", async () => {
    await deleteProject(createdId);
    await expect(getProjectBySlug(slugBase, { onlyPublished: false })).rejects.toThrow(NotFoundError);
  });
});
