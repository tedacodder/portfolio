// Turns "What I Learned Building Distributed Systems" into
// "what-i-learned-building-distributed-systems".
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/**
 * Generates a unique slug by appending -2, -3, ... on collision.
 * `checkExists` should return true if the candidate slug is already taken
 * (typically excluding the current row's own id on updates).
 */
export async function generateUniqueSlug(
  baseInput: string,
  checkExists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(baseInput);
  if (!base) {
    throw new Error("Cannot generate a slug from empty input");
  }

  let candidate = base;
  let suffix = 2;

  // Bounded loop: in pathological cases (thousands of colliding slugs) we
  // stop rather than looping forever, and let the caller surface a conflict.
  while (await checkExists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
    if (suffix > 1000) {
      throw new Error("Unable to generate a unique slug after 1000 attempts");
    }
  }

  return candidate;
}
