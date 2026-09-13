import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { socialLinks } from "@/db/schema";
import { NotFoundError } from "../errors/app-error";
import type { CreateSocialLinkInput, UpdateSocialLinkInput } from "../validation/social-links";

export async function listSocialLinks({ onlyVisible }: { onlyVisible: boolean }) {
  const where = onlyVisible ? eq(socialLinks.visible, true) : undefined;
  return db.select().from(socialLinks).where(where).orderBy(asc(socialLinks.displayOrder));
}

export async function getSocialLinkById(id: string) {
  const [row] = await db.select().from(socialLinks).where(eq(socialLinks.id, id)).limit(1);
  if (!row) throw new NotFoundError("Social link");
  return row;
}

export async function createSocialLink(input: CreateSocialLinkInput) {
  const [created] = await db.insert(socialLinks).values(input).returning();
  return created;
}

export async function updateSocialLink(id: string, input: UpdateSocialLinkInput) {
  await getSocialLinkById(id);
  const [updated] = await db
    .update(socialLinks)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(socialLinks.id, id))
    .returning();
  return updated;
}

export async function deleteSocialLink(id: string) {
  await getSocialLinkById(id);
  await db.delete(socialLinks).where(eq(socialLinks.id, id));
}
