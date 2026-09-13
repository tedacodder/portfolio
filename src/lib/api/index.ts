import { postOne, ApiError } from "./fetcher";
import type { ContactPayload } from "@/types/api";

export { ApiError };

// This file is imported by Client Components (e.g. ContactForm.tsx), so it
// must stay browser-safe: no imports of "@/db", "@/lib/services/*", or
// anything else that pulls in the `postgres` driver — that driver needs
// Node built-ins (fs, net, tls, perf_hooks) that don't exist in a browser
// bundle, and Turbopack will fail the whole build if this file (or anything
// it imports) drags that in transitively.
//
// The read-only data functions previously lived here as direct DB calls,
// which broke exactly that rule. They've moved to "@/lib/data" (guarded by
// `import "server-only"`) for use from Server Components, layouts, and
// sitemap.ts. This file now only has what a Client Component genuinely
// needs: submitting the contact form over a real browser fetch.

export async function submitContactForm(
  payload: ContactPayload
): Promise<{ received: boolean }> {
  return postOne("/api/contact", payload);
}
