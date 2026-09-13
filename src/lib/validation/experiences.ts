import { z } from "zod";
import { dateStringSchema, displayOrderSchema, optionalUrlSchema, shortTextSchema, uuidSchema } from "./common";

export const employmentTypeSchema = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "FREELANCE",
]);

export const createExperienceSchema = z.object({
  company: shortTextSchema(200),
  role: shortTextSchema(200),
  employmentType: employmentTypeSchema.default("FULL_TIME"),
  location: z.string().max(200).optional(),
  description: z.string().max(10000).optional(),
  startDate: dateStringSchema,
  endDate: dateStringSchema.optional(),
  current: z.boolean().default(false),
  companyUrl: optionalUrlSchema,
  displayOrder: displayOrderSchema,
  highlights: z.array(shortTextSchema(500)).max(50).optional(),
  technologyIds: z.array(uuidSchema).max(100).optional(),
})
  .refine((data) => !data.current || !data.endDate, {
    message: "An ongoing role (current=true) cannot have an endDate",
    path: ["endDate"],
  });

export const updateExperienceSchema = z.object({
  company: shortTextSchema(200).optional(),
  role: shortTextSchema(200).optional(),
  employmentType: employmentTypeSchema.optional(),
  location: z.string().max(200).optional(),
  description: z.string().max(10000).optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  current: z.boolean().optional(),
  companyUrl: optionalUrlSchema,
  displayOrder: displayOrderSchema.optional(),
  highlights: z.array(shortTextSchema(500)).max(50).optional(),
  technologyIds: z.array(uuidSchema).max(100).optional(),
});

export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;
