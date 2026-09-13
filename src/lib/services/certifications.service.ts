import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { certifications } from "@/db/schema";
import { NotFoundError } from "../errors/app-error";
import type { CreateCertificationInput, UpdateCertificationInput } from "../validation/certifications";

export async function listCertifications() {
  return db.select().from(certifications).orderBy(desc(certifications.issuedAt));
}

export async function getCertificationById(id: string) {
  const [row] = await db.select().from(certifications).where(eq(certifications.id, id)).limit(1);
  if (!row) throw new NotFoundError("Certification");
  return row;
}

export async function createCertification(input: CreateCertificationInput) {
  const [created] = await db.insert(certifications).values(input).returning();
  return created;
}

export async function updateCertification(id: string, input: UpdateCertificationInput) {
  await getCertificationById(id);
  const [updated] = await db
    .update(certifications)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(certifications.id, id))
    .returning();
  return updated;
}

export async function deleteCertification(id: string) {
  await getCertificationById(id);
  await db.delete(certifications).where(eq(certifications.id, id));
}
