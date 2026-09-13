import { z } from "zod";
import { dateStringSchema, displayOrderSchema, optionalUrlSchema, shortTextSchema } from "./common";

export const createEducationSchema = z
  .object({
    institution: shortTextSchema(200),
    degree: shortTextSchema(200),
    fieldOfStudy: z.string().max(200).optional(),
    description: z.string().max(5000).optional(),
    startDate: dateStringSchema,
    endDate: dateStringSchema.optional(),
    current: z.boolean().default(false),
    location: z.string().max(200).optional(),
    url: optionalUrlSchema,
    displayOrder: displayOrderSchema,
  })
  .refine((data) => !data.current || !data.endDate, {
    message: "Ongoing education (current=true) cannot have an endDate",
    path: ["endDate"],
  });

export const updateEducationSchema = z.object({
  institution: shortTextSchema(200).optional(),
  degree: shortTextSchema(200).optional(),
  fieldOfStudy: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  current: z.boolean().optional(),
  location: z.string().max(200).optional(),
  url: optionalUrlSchema,
  displayOrder: displayOrderSchema.optional(),
});

export type CreateEducationInput = z.infer<typeof createEducationSchema>;
export type UpdateEducationInput = z.infer<typeof updateEducationSchema>;
