import { z } from "zod";
import { displayOrderSchema, shortTextSchema } from "./common";

export const createPrincipleSchema = z.object({
  title: shortTextSchema(200),
  description: shortTextSchema(2000),
  displayOrder: displayOrderSchema,
});

export const updatePrincipleSchema = createPrincipleSchema.partial();

export type CreatePrincipleInput = z.infer<typeof createPrincipleSchema>;
export type UpdatePrincipleInput = z.infer<typeof updatePrincipleSchema>;
