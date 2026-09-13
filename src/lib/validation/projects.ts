import { z } from "zod";
import { dateStringSchema, displayOrderSchema, optionalUrlSchema, shortTextSchema, slugSchema, uuidSchema } from "./common";

export const projectStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const architectureNodeTypeSchema = z.enum([
  "SERVICE",
  "DATABASE",
  "QUEUE",
  "CACHE",
  "CLIENT",
  "EXTERNAL",
  "GATEWAY",
  "STORAGE",
]);

export const createProjectSchema = z.object({
  title: shortTextSchema(200),
  slug: slugSchema.optional(),
  shortDescription: shortTextSchema(500),
  description: z.string().max(20000).optional(),
  problem: z.string().max(5000).optional(),
  solution: z.string().max(5000).optional(),
  featured: z.boolean().default(false),
  status: projectStatusSchema.default("DRAFT"),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  githubUrl: optionalUrlSchema,
  liveUrl: optionalUrlSchema,
  coverImageUrl: optionalUrlSchema,
  architectureDescription: z.string().max(10000).optional(),
  displayOrder: displayOrderSchema,
  // Technology ids to associate via project_technologies. Optional — a
  // project can be created without technologies and have them attached later.
  technologyIds: z.array(uuidSchema).max(100).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const projectListQuerySchema = z.object({
  status: projectStatusSchema.optional(),
  featured: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

// Architecture sub-resources
export const upsertArchitectureLayerSchema = z.object({
  name: shortTextSchema(200),
  description: z.string().max(2000).optional(),
  displayOrder: displayOrderSchema,
});
export const updateArchitectureLayerSchema = upsertArchitectureLayerSchema.partial();

export const upsertArchitectureNodeSchema = z.object({
  layerId: uuidSchema.optional(),
  label: shortTextSchema(200),
  type: architectureNodeTypeSchema,
  description: z.string().max(2000).optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
});
export const updateArchitectureNodeSchema = upsertArchitectureNodeSchema.partial();

export const upsertArchitectureConnectionSchema = z.object({
  fromNodeId: uuidSchema,
  toNodeId: uuidSchema,
  label: z.string().max(200).optional(),
});
