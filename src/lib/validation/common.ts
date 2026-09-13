import { z } from "zod";

// Shared primitive validators reused across every domain schema, so
// "what counts as a valid slug / URL / email" is defined exactly once.

// Zod 4 moved string-format validators (email/url/uuid) to top-level
// factories instead of chained `.string().x()` methods. `z.uuid()` /
// `z.email()` / `z.url()` still return string schemas, so the rest of the
// chain (`.trim()`, `.max()`, custom messages) works the same way.
export const uuidSchema = z.uuid("Must be a valid UUID");

export const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Must be a lowercase, hyphen-separated slug");

export const emailSchema = z.email("Must be a valid email address").trim().max(320);

export const urlSchema = z.url("Must be a valid URL").trim().max(2048);
export const optionalUrlSchema = urlSchema.optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v));

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a date in YYYY-MM-DD format");

export const shortTextSchema = (max: number) => z.string().trim().min(1).max(max);
export const optionalShortTextSchema = (max: number) => z.string().trim().max(max).optional();

export const displayOrderSchema = z.coerce.number().int().min(0).default(0);

export const booleanQuerySchema = z
  .enum(["true", "false"])
  .transform((v) => v === "true")
  .optional();
