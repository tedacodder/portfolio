import { z } from "zod";
import { dateStringSchema, optionalUrlSchema, shortTextSchema } from "./common";

export const createCertificationSchema = z
  .object({
    name: shortTextSchema(300),
    issuer: shortTextSchema(200),
    credentialId: z.string().max(200).optional(),
    credentialUrl: optionalUrlSchema,
    issuedAt: dateStringSchema.optional(),
    expiresAt: dateStringSchema.optional(),
    imageUrl: optionalUrlSchema,
    description: z.string().max(5000).optional(),
  })
  .refine((data) => !data.expiresAt || !data.issuedAt || data.expiresAt >= data.issuedAt, {
    message: "expiresAt cannot be before issuedAt",
    path: ["expiresAt"],
  });

export const updateCertificationSchema = z.object({
  name: shortTextSchema(300).optional(),
  issuer: shortTextSchema(200).optional(),
  credentialId: z.string().max(200).optional(),
  credentialUrl: optionalUrlSchema,
  issuedAt: dateStringSchema.optional(),
  expiresAt: dateStringSchema.optional(),
  imageUrl: optionalUrlSchema,
  description: z.string().max(5000).optional(),
});

export type CreateCertificationInput = z.infer<typeof createCertificationSchema>;
export type UpdateCertificationInput = z.infer<typeof updateCertificationSchema>;
