import { and, asc, count, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import {
  architectureConnections,
  architectureLayers,
  architectureNodes,
  projects,
  projectTechnologies,
  technologies,
} from "@/db/schema";
import { ConflictError, NotFoundError } from "../errors/app-error";
import { generateUniqueSlug } from "../utils/slug";
import { isUniqueViolation } from "../utils/db-errors";
import { toOffset, type PaginationQuery } from "../validation/pagination";
import type { CreateProjectInput, UpdateProjectInput } from "../validation/projects";

interface ListFilters {
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured?: boolean;
}

async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const [row] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, slug)).limit(1);
  return Boolean(row && row.id !== excludeId);
}

async function getTechnologiesForProjects(projectIds: string[]) {
  if (projectIds.length === 0) return new Map<string, (typeof technologies.$inferSelect)[]>();

  const rows = await db
    .select({
      projectId: projectTechnologies.projectId,
      technology: technologies,
    })
    .from(projectTechnologies)
    .innerJoin(technologies, eq(projectTechnologies.technologyId, technologies.id))
    .where(inArray(projectTechnologies.projectId, projectIds));

  const map = new Map<string, (typeof technologies.$inferSelect)[]>();
  for (const row of rows) {
    const list = map.get(row.projectId) ?? [];
    list.push(row.technology);
    map.set(row.projectId, list);
  }
  return map;
}

export async function listProjects(pagination: PaginationQuery, filters: ListFilters) {
  const conditions = [
    filters.status ? eq(projects.status, filters.status) : undefined,
    filters.featured !== undefined ? eq(projects.featured, filters.featured) : undefined,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined);
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(projects)
      .where(where)
      .orderBy(asc(projects.displayOrder), asc(projects.title))
      .limit(pagination.limit)
      .offset(toOffset(pagination.page, pagination.limit)),
    db.select({ value: count() }).from(projects).where(where),
  ]);

  const techByProject = await getTechnologiesForProjects(rows.map((r) => r.id));

  return {
    rows: rows.map((row) => ({ ...row, technologies: techByProject.get(row.id) ?? [] })),
    total: totalResult[0]?.value ?? 0,
  };
}

async function attachTechnologiesToOne(project: typeof projects.$inferSelect) {
  const map = await getTechnologiesForProjects([project.id]);
  return { ...project, technologies: map.get(project.id) ?? [] };
}

export async function getProjectById(id: string) {
  const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!row) throw new NotFoundError("Project");
  return attachTechnologiesToOne(row);
}

export async function getProjectBySlug(slug: string, { onlyPublished }: { onlyPublished: boolean }) {
  const conditions = onlyPublished
    ? and(eq(projects.slug, slug), eq(projects.status, "PUBLISHED"))
    : eq(projects.slug, slug);

  const [row] = await db.select().from(projects).where(conditions).limit(1);
  if (!row) throw new NotFoundError("Project");
  return attachTechnologiesToOne(row);
}

export async function createProject(input: CreateProjectInput) {
  const { technologyIds, ...rest } = input;

  let resolvedSlug: string;
  if (rest.slug) {
    if (await isSlugTaken(rest.slug)) {
      throw new ConflictError("Slug already in use");
    }
    resolvedSlug = rest.slug;
  } else {
    resolvedSlug = await generateUniqueSlug(rest.title, (candidate) => isSlugTaken(candidate));
  }

  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(projects)
      .values({ ...rest, slug: resolvedSlug })
      .returning();

    if (!created) throw new Error("Failed to create project");

    if (technologyIds && technologyIds.length > 0) {
      await tx.insert(projectTechnologies).values(
        technologyIds.map((technologyId) => ({ projectId: created.id, technologyId })),
      );
    }

    return created;
  });
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  await getProjectById(id);

  const { technologyIds, ...rest } = input;

  if (rest.slug && (await isSlugTaken(rest.slug, id))) {
    throw new ConflictError("Slug already in use");
  }

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(projects)
      .set({ ...rest, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    if (technologyIds) {
      await tx.delete(projectTechnologies).where(eq(projectTechnologies.projectId, id));
      if (technologyIds.length > 0) {
        await tx.insert(projectTechnologies).values(
          technologyIds.map((technologyId) => ({ projectId: id, technologyId })),
        );
      }
    }

    return updated;
  });
}

export async function deleteProject(id: string) {
  await getProjectById(id);
  // Hard delete is acceptable here: projects already carry a status enum
  // (DRAFT/PUBLISHED/ARCHIVED) for the "don't want it public anymore" case.
  // A genuine delete request means "remove it entirely" — cascading
  // project_technologies/architecture rows via onDelete: cascade.
  await db.delete(projects).where(eq(projects.id, id));
}

// ---- Architecture sub-resources ----

export async function getProjectArchitecture(projectId: string) {
  await getProjectById(projectId);

  const [layers, nodes, connections] = await Promise.all([
    db
      .select()
      .from(architectureLayers)
      .where(eq(architectureLayers.projectId, projectId))
      .orderBy(asc(architectureLayers.displayOrder)),
    db.select().from(architectureNodes).where(eq(architectureNodes.projectId, projectId)),
    db.select().from(architectureConnections).where(eq(architectureConnections.projectId, projectId)),
  ]);

  return { layers, nodes, connections };
}

export async function addArchitectureLayer(
  projectId: string,
  input: { name: string; description?: string; displayOrder: number },
) {
  await getProjectById(projectId);
  const [created] = await db
    .insert(architectureLayers)
    .values({ projectId, ...input })
    .returning();
  return created;
}

export async function updateArchitectureLayer(
  projectId: string,
  layerId: string,
  input: Partial<{ name: string; description?: string; displayOrder: number }>,
) {
  await getProjectById(projectId);
  const [updated] = await db
    .update(architectureLayers)
    .set(input)
    .where(and(eq(architectureLayers.id, layerId), eq(architectureLayers.projectId, projectId)))
    .returning();
  if (!updated) throw new NotFoundError("Architecture layer");
  return updated;
}

export async function deleteArchitectureLayer(projectId: string, layerId: string) {
  await getProjectById(projectId);
  const result = await db
    .delete(architectureLayers)
    .where(and(eq(architectureLayers.id, layerId), eq(architectureLayers.projectId, projectId)))
    .returning({ id: architectureLayers.id });
  if (result.length === 0) throw new NotFoundError("Architecture layer");
}

export async function addArchitectureNode(
  projectId: string,
  input: {
    layerId?: string;
    label: string;
    type: (typeof architectureNodes.$inferInsert)["type"];
    description?: string;
    position?: { x: number; y: number };
  },
) {
  await getProjectById(projectId);
  const [created] = await db
    .insert(architectureNodes)
    .values({ projectId, ...input })
    .returning();
  return created;
}

export async function updateArchitectureNode(
  projectId: string,
  nodeId: string,
  input: Partial<{
    layerId?: string;
    label: string;
    type: (typeof architectureNodes.$inferInsert)["type"];
    description?: string;
    position?: { x: number; y: number };
  }>,
) {
  await getProjectById(projectId);
  const [updated] = await db
    .update(architectureNodes)
    .set(input)
    .where(and(eq(architectureNodes.id, nodeId), eq(architectureNodes.projectId, projectId)))
    .returning();
  if (!updated) throw new NotFoundError("Architecture node");
  return updated;
}

export async function deleteArchitectureNode(projectId: string, nodeId: string) {
  await getProjectById(projectId);
  // Connections referencing this node are removed first — there is no FK
  // cascade defined for architecture_connections, and leaving a dangling
  // connection would break the public architecture visualization.
  await db
    .delete(architectureConnections)
    .where(
      and(
        eq(architectureConnections.projectId, projectId),
        or(eq(architectureConnections.fromNodeId, nodeId), eq(architectureConnections.toNodeId, nodeId)),
      ),
    );
  const result = await db
    .delete(architectureNodes)
    .where(and(eq(architectureNodes.id, nodeId), eq(architectureNodes.projectId, projectId)))
    .returning({ id: architectureNodes.id });
  if (result.length === 0) throw new NotFoundError("Architecture node");
}

export async function addArchitectureConnection(
  projectId: string,
  input: { fromNodeId: string; toNodeId: string; label?: string },
) {
  await getProjectById(projectId);
  try {
    const [created] = await db
      .insert(architectureConnections)
      .values({ projectId, ...input })
      .returning();
    return created;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError("This connection already exists");
    }
    throw error;
  }
}

export async function deleteArchitectureConnection(projectId: string, connectionId: string) {
  await getProjectById(projectId);
  const result = await db
    .delete(architectureConnections)
    .where(and(eq(architectureConnections.id, connectionId), eq(architectureConnections.projectId, projectId)))
    .returning({ id: architectureConnections.id });
  if (result.length === 0) throw new NotFoundError("Architecture connection");
}
