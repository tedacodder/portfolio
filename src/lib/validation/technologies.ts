import { z } from "zod";
import { displayOrderSchema, shortTextSchema, slugSchema } from "./common";

export const createTechnologySchema = z.object({
  name: shortTextSchema(100),
  slug: slugSchema.optional(), // auto-generated from `name` if omitted
  description: z.string().max(2000).optional(),
  icon: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  featured: z.boolean().default(false),
  displayOrder: displayOrderSchema,
});

export const updateTechnologySchema = createTechnologySchema.partial();

export type CreateTechnologyInput = z.infer<typeof createTechnologySchema>;
export type UpdateTechnologyInput = z.infer<typeof updateTechnologySchema>;

export const technologyListQuerySchema = z.object({
  category: z.string().max(100).optional(),
  featured: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});
