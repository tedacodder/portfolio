import { z } from "zod";
import { dateStringSchema, displayOrderSchema, optionalUrlSchema, shortTextSchema } from "./common";

export const createAchievementSchema = z.object({
  title: shortTextSchema(300),
  description: z.string().max(5000).optional(),
  organization: z.string().max(200).optional(),
  date: dateStringSchema.optional(),
  url: optionalUrlSchema,
  imageUrl: optionalUrlSchema,
  displayOrder: displayOrderSchema,
});

export const updateAchievementSchema = createAchievementSchema.partial();

export type CreateAchievementInput = z.infer<typeof createAchievementSchema>;
export type UpdateAchievementInput = z.infer<typeof updateAchievementSchema>;
