import { z } from "zod";
import { dateStringSchema, displayOrderSchema, shortTextSchema, uuidSchema } from "./common";

export const learningStatusSchema = z.enum(["PLANNED", "LEARNING", "PAUSED", "COMPLETED"]);

export const createLearningTopicSchema = z.object({
  topic: shortTextSchema(200),
  description: z.string().max(5000).optional(),
  progress: z.number().int().min(0).max(100).default(0),
  status: learningStatusSchema.default("PLANNED"),
  displayOrder: displayOrderSchema,
  startedAt: dateStringSchema.optional(),
  targetDate: dateStringSchema.optional(),
  technologyIds: z.array(uuidSchema).max(50).optional(),
});

export const updateLearningTopicSchema = createLearningTopicSchema.partial();

export type CreateLearningTopicInput = z.infer<typeof createLearningTopicSchema>;
export type UpdateLearningTopicInput = z.infer<typeof updateLearningTopicSchema>;

export const learningListQuerySchema = z.object({
  status: learningStatusSchema.optional(),
});
