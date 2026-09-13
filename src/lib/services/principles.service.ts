import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { principles } from "@/db/schema";
import { NotFoundError } from "../errors/app-error";
import type { CreatePrincipleInput, UpdatePrincipleInput } from "../validation/principles";

export async function listPrinciples() {
  return db.select().from(principles).orderBy(asc(principles.displayOrder));
}

export async function getPrincipleById(id: string) {
  const [row] = await db.select().from(principles).where(eq(principles.id, id)).limit(1);
  if (!row) throw new NotFoundError("Principle");
  return row;
}

export async function createPrinciple(input: CreatePrincipleInput) {
  const [created] = await db.insert(principles).values(input).returning();
  return created;
}

export async function updatePrinciple(id: string, input: UpdatePrincipleInput) {
  await getPrincipleById(id);
  const [updated] = await db
    .update(principles)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(principles.id, id))
    .returning();
  return updated;
}

export async function deletePrinciple(id: string) {
  await getPrincipleById(id);
  await db.delete(principles).where(eq(principles.id, id));
}
