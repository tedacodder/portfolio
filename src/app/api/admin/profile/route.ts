import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { requireAdmin } from "@/lib/auth/middleware";
import { upsertProfileSchema } from "@/lib/validation/profile";
import { getProfileOrNull, upsertProfile } from "@/lib/services/profile.service";

// GET /api/admin/profile
// Auth: required
// Response: { success: true, data: profile | null }
export const GET = withErrorHandler(async () => {
  await requireAdmin();
  const profile = await getProfileOrNull();
  return ok(profile);
});

// PATCH /api/admin/profile
// Auth: required
// Body: the full profile object (name, headline, shortBio, email are
//   required; everything else optional). Creates the profile row on first
//   call, updates it on every call after that — the profile table only
//   ever has one row.
// Response: { success: true, data: profile }
export const PATCH = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();
  const body = await request.json();
  const input = upsertProfileSchema.parse(body);
  const profile = await upsertProfile(input);
  return ok(profile);
});
