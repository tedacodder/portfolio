import { describe, expect, it } from "vitest";
import { emailSchema, slugSchema, uuidSchema } from "@/lib/validation/common";
import { loginSchema } from "@/lib/validation/auth";
import { createProjectSchema, projectStatusSchema } from "@/lib/validation/projects";
import { createArticleSchema } from "@/lib/validation/articles";
import { createContactMessageSchema } from "@/lib/validation/contact";
import { paginationQuerySchema } from "@/lib/validation/pagination";

describe("common validators", () => {
  it("rejects an invalid email", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
    expect(emailSchema.safeParse("person@example.com").success).toBe(true);
  });

  it("rejects an invalid UUID", () => {
    expect(uuidSchema.safeParse("not-a-uuid").success).toBe(false);
    expect(uuidSchema.safeParse("123e4567-e89b-12d3-a456-426614174000").success).toBe(true);
  });

  it("rejects an invalid slug", () => {
    expect(slugSchema.safeParse("Not A Slug!").success).toBe(false);
    expect(slugSchema.safeParse("a-valid-slug-123").success).toBe(true);
  });

  it("rejects an invalid enum value", () => {
    expect(projectStatusSchema.safeParse("PUBLISHEDD").success).toBe(false);
    expect(projectStatusSchema.safeParse("PUBLISHED").success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("requires email and password", () => {
    expect(loginSchema.safeParse({}).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });
});

describe("createProjectSchema", () => {
  it("fails when required fields are missing", () => {
    const result = createProjectSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("succeeds with just the required fields and defaults the rest", () => {
    const result = createProjectSchema.safeParse({
      title: "My Project",
      shortDescription: "A short description",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("DRAFT");
      expect(result.data.featured).toBe(false);
    }
  });

  it("rejects an invalid URL for githubUrl", () => {
    const result = createProjectSchema.safeParse({
      title: "My Project",
      shortDescription: "A short description",
      githubUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});

describe("createArticleSchema", () => {
  it("requires content", () => {
    const result = createArticleSchema.safeParse({ title: "Post" });
    expect(result.success).toBe(false);
  });
});

describe("createContactMessageSchema", () => {
  it("rejects a too-short message", () => {
    const result = createContactMessageSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      message: "hi",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid submission", () => {
    const result = createContactMessageSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      message: "This is a long enough contact message to pass validation.",
    });
    expect(result.success).toBe(true);
  });
});

describe("paginationQuerySchema", () => {
  it("defaults page and limit", () => {
    const result = paginationQuerySchema.parse({});
    expect(result).toEqual({ page: 1, limit: 20 });
  });

  it("rejects a limit above the maximum", () => {
    expect(paginationQuerySchema.safeParse({ limit: 500 }).success).toBe(false);
  });
});
