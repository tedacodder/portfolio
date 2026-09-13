import { describe, expect, it } from "vitest";
import { generateUniqueSlug, slugify } from "@/lib/utils/slug";

describe("slugify", () => {
  it("converts a title to a lowercase hyphenated slug", () => {
    expect(slugify("SraHub")).toBe("srahub");
    expect(slugify("What I Learned Building Distributed Systems")).toBe(
      "what-i-learned-building-distributed-systems",
    );
  });

  it("strips punctuation and collapses whitespace", () => {
    expect(slugify("Redis Pub/Sub: How it Works!")).toBe("redis-pub-sub-how-it-works");
  });

  it("strips accents", () => {
    expect(slugify("Café Résumé")).toBe("cafe-resume");
  });
});

describe("generateUniqueSlug", () => {
  it("returns the base slug when it's not taken", async () => {
    const slug = await generateUniqueSlug("My Project", async () => false);
    expect(slug).toBe("my-project");
  });

  it("appends -2, -3, ... on collisions", async () => {
    const taken = new Set(["my-project", "my-project-2"]);
    const slug = await generateUniqueSlug("My Project", async (candidate) => taken.has(candidate));
    expect(slug).toBe("my-project-3");
  });

  it("throws on empty input", async () => {
    await expect(generateUniqueSlug("   ", async () => false)).rejects.toThrow();
  });
});
