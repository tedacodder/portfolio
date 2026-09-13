import { z } from "zod";
import { emailSchema, shortTextSchema } from "./common";

export const contactStatusSchema = z.enum(["UNREAD", "READ", "ARCHIVED"]);

// Public-facing: kept deliberately strict on length to reduce spam/abuse
// surface, on top of the rate limiter applied in the route handler.
export const createContactMessageSchema = z.object({
  name: shortTextSchema(200),
  email: emailSchema,
  subject: z.string().max(300).optional(),
  message: z.string().trim().min(10, "Message is too short").max(5000),
  // Honeypot field: real users never fill this in (it's hidden via CSS on
  // the frontend). If present and non-empty, the route silently discards
  // the submission as spam.
  website: z.string().max(500).optional(),
});

export const updateContactMessageSchema = z.object({
  status: contactStatusSchema,
});

export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;
