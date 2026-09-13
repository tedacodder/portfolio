import { withErrorHandler } from "@/lib/errors/handler";
import { ok } from "@/lib/utils/response";
import { listCertifications } from "@/lib/services/certifications.service";

export const GET = withErrorHandler(async () => {
  const rows = await listCertifications();
  return ok(rows);
});
