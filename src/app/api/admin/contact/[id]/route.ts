import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { noContent, ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { uuidSchema } from "@/lib/validation/common";
import { updateContactMessageSchema } from "@/lib/validation/contact";
import {
  deleteContactMessage,
  getContactMessageById,
  updateContactMessageStatus,
} from "@/lib/services/contact.service";
import type { RouteParams } from "@/types/route-params";

// GET /api/admin/contact/:id — Auth: required
export const GET = withErrorHandler(async (_request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  const row = await getContactMessageById(uuidSchema.parse(id));
  return ok(row);
});

// PATCH /api/admin/contact/:id — Auth: required. Body: { status }
export const PATCH = withErrorHandler(async (request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json();
  const { status } = updateContactMessageSchema.parse(body);
  const updated = await updateContactMessageStatus(uuidSchema.parse(id), status);
  return ok(updated);
});

// DELETE /api/admin/contact/:id — Auth: required
export const DELETE = withErrorHandler(async (_request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  await deleteContactMessage(uuidSchema.parse(id));
  return noContent();
});
