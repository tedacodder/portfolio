import { z } from "zod";
import { displayOrderSchema, shortTextSchema, urlSchema } from "./common";

export const createSocialLinkSchema = z.object({
  platform: shortTextSchema(100),
  label: z.string().max(200).optional(),
  url: urlSchema,
  icon: z.string().max(200).optional(),
  displayOrder: displayOrderSchema,
  visible: z.boolean().default(true),
});

export const updateSocialLinkSchema = createSocialLinkSchema.partial();

export type CreateSocialLinkInput = z.infer<typeof createSocialLinkSchema>;
export type UpdateSocialLinkInput = z.infer<typeof updateSocialLinkSchema>;
