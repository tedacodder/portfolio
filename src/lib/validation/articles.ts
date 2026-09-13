import { z } from "zod";
import { optionalUrlSchema, shortTextSchema, slugSchema } from "./common";

export const articleStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createArticleSchema = z.object({
  title: shortTextSchema(300),
  slug: slugSchema.optional(),
  excerpt: z.string().max(1000).optional(),
  content: z.string().min(1, "Content is required").max(200000),
  coverImageUrl: optionalUrlSchema,
  status: articleStatusSchema.default("DRAFT"),
  readingTimeMinutes: z.number().int().min(1).max(600).optional(),
  featured: z.boolean().default(false),
  tags: z.array(shortTextSchema(50)).max(20).optional(),
});

export const updateArticleSchema = createArticleSchema.partial();

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;

export const articleListQuerySchema = z.object({
  status: articleStatusSchema.optional(),
  featured: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  tag: z.string().max(50).optional(),
});
