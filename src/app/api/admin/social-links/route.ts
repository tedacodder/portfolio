import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { createSocialLinkSchema } from "@/lib/validation/social-links";
import { createSocialLink, listSocialLinks } from "@/lib/services/social-links.service";

export const GET = withErrorHandler(async () => {
  await requireAdmin();
  const rows = await listSocialLinks({ onlyVisible: false });
  return ok(rows);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const body = await request.json();
  const input = createSocialLinkSchema.parse(body);
  const created = await createSocialLink(input);
  return ok(created, 201);
});
