import { z } from "zod";
import { dateStringSchema, displayOrderSchema, shortTextSchema } from "./common";

export const createTimelineEntrySchema = z.object({
  yearOrLabel: shortTextSchema(50),
  title: shortTextSchema(300),
  description: z.string().max(5000).optional(),
  date: dateStringSchema.optional(),
  displayOrder: displayOrderSchema,
});

export const updateTimelineEntrySchema = createTimelineEntrySchema.partial();

export type CreateTimelineEntryInput = z.infer<typeof createTimelineEntrySchema>;
export type UpdateTimelineEntryInput = z.infer<typeof updateTimelineEntrySchema>;
