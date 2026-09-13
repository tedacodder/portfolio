import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { NotFoundError } from "../errors/app-error";
import type { UpsertProfileInput } from "../validation/profile";

// The profile table is a singleton in practice. These helpers enforce that
// by always operating on "the first row" rather than exposing a general
// create-many API.

export async function getProfile() {
  const [row] = await db.select().from(profile).limit(1);
  if (!row) {
    throw new NotFoundError("Profile");
  }
  return row;
}

export async function getProfileOrNull() {
  const [row] = await db.select().from(profile).limit(1);
  return row ?? null;
}

/** Creates the profile row if none exists yet, otherwise updates the existing one. */
export async function upsertProfile(input: UpsertProfileInput) {
  const existing = await getProfileOrNull();

  if (!existing) {
    const [created] = await db.insert(profile).values(input).returning();
    return created;
  }

  const [updated] = await db
    .update(profile)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(profile.id, existing.id))
    .returning();

  return updated;
}
