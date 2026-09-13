import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { getProjectArchitecture, getProjectBySlug } from "@/lib/services/projects.service";
import { slugSchema } from "@/lib/validation/common";
import type { RouteParams } from "@/types/route-params";

// GET /api/projects/:slug
// Auth: public — 404s for anything that isn't PUBLISHED (draft/archived
// slugs are indistinguishable from nonexistent ones to anonymous clients).
// Response includes the project's architecture diagram data inline, since
// the frontend renders both together.
export const GET = withErrorHandler(async (_request: NextRequest, { params }: RouteParams<{ slug: string }>) => {
  const { slug } = await params;
  const validSlug = slugSchema.parse(slug);

  const project = await getProjectBySlug(validSlug, { onlyPublished: true });
  const architecture = await getProjectArchitecture(project.id);

  return ok({ ...project, architecture });
});
