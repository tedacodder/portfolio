import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { noContent, ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { uuidSchema } from "@/lib/validation/common";
import { updateSocialLinkSchema } from "@/lib/validation/social-links";
import { deleteSocialLink, getSocialLinkById, updateSocialLink } from "@/lib/services/social-links.service";
import type { RouteParams } from "@/types/route-params";

export const GET = withErrorHandler(async (_request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  const row = await getSocialLinkById(uuidSchema.parse(id));
  return ok(row);
});

export const PATCH = withErrorHandler(async (request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json();
  const input = updateSocialLinkSchema.parse(body);
  const updated = await updateSocialLink(uuidSchema.parse(id), input);
  return ok(updated);
});

export const DELETE = withErrorHandler(async (_request: NextRequest, { params }: RouteParams<{ id: string }>) => {
  await requireAdmin();
  const { id } = await params;
  await deleteSocialLink(uuidSchema.parse(id));
  return noContent();
});
