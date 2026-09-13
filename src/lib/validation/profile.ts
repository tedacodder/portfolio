import { z } from "zod";
import { emailSchema, optionalUrlSchema, shortTextSchema } from "./common";

export const upsertProfileSchema = z.object({
  name: shortTextSchema(200),
  headline: shortTextSchema(300),
  shortBio: shortTextSchema(500),
  longBio: z.string().max(20000).optional(),
  location: z.string().max(200).optional(),
  availabilityStatus: z.string().max(100).optional(),
  profileImageUrl: optionalUrlSchema,
  resumeUrl: optionalUrlSchema,
  githubUrl: optionalUrlSchema,
  linkedinUrl: optionalUrlSchema,
  email: emailSchema,
  websiteUrl: optionalUrlSchema,
});

export type UpsertProfileInput = z.infer<typeof upsertProfileSchema>;
