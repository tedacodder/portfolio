import { z } from "zod";
import { displayOrderSchema, shortTextSchema, uuidSchema } from "./common";

export const createSkillSchema = z.object({
  name: shortTextSchema(100),
  category: shortTextSchema(100),
  description: z.string().max(2000).optional(),
  // 0-100. Deliberately coarse — see schema comment on skills.proficiency.
  proficiency: z.number().int().min(0).max(100).optional(),
  displayOrder: displayOrderSchema,
  technologyId: uuidSchema.optional(),
});

export const updateSkillSchema = createSkillSchema.partial();

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;

export const skillListQuerySchema = z.object({
  category: z.string().max(100).optional(),
});
