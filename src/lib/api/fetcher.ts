import type { ApiEnvelope, ApiListEnvelope, ApiErrorEnvelope } from "@/types/api";

// The API now lives in this same Next.js app, so relative paths ("/api/...")
// are the default and correct choice in every deployment. Only set
// NEXT_PUBLIC_API_URL if the API is ever split into a separate deployment.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface FetchOptions {
  /** Next.js revalidation window in seconds. Omit for the default (60s). */
  revalidate?: number | false;
  cache?: RequestCache;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

async function request(path: string, options: FetchOptions = {}): Promise<Response> {
  const { revalidate = 60, method = "GET", body, cache } = options;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      // `cache` and `next.revalidate` are mutually exclusive in the fetch API.
      ...(cache ? { cache } : { next: { revalidate } }),
    });
  } catch {
    throw new ApiError("Unable to reach the API", 0);
  }

  if (!res.ok) {
    let message = `Request to ${path} failed`;
    try {
      const errBody = (await res.json()) as ApiErrorEnvelope;
      if (errBody?.error?.message) message = errBody.error.message;
      // Validation errors (422) come back with a generic "Invalid request"
      // message plus a zod `flattenError()`-shaped `details` object
      // (`{ fieldErrors: Record<string, string[]>, formErrors: string[] }`).
      // Previously that per-field detail was fetched and then discarded,
      // so every form's error box just said "Invalid request" with no
      // indication of which field was wrong. Fold the field errors into
      // the message so the existing single-string error UI in every admin
      // form actually tells the user what to fix.
      const details = errBody?.error?.details as
        | { fieldErrors?: Record<string, string[]>; formErrors?: string[] }
        | undefined;
      if (details && (details.fieldErrors || details.formErrors)) {
        const fieldMessages = Object.entries(details.fieldErrors ?? {})
          .filter(([, msgs]) => msgs && msgs.length > 0)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`);
        const allMessages = [...(details.formErrors ?? []), ...fieldMessages];
        if (allMessages.length > 0) {
          message = allMessages.join("; ");
        }
      }
    } catch {
      // response wasn't JSON — keep the generic message
    }
    // A 401 on an admin-only endpoint almost always means the session
    // cookie expired mid-visit (the server-side layout guard only runs on
    // navigation, so a stale tab can still submit a mutation after
    // expiry). Previously this surfaced as a bare "Unauthorized" next to a
    // save button, which reads like a permissions bug rather than what it
    // is. Every admin form already renders `ApiError.message` directly, so
    // fixing the message here fixes the UX everywhere without touching
    // each of the ~15 form components individually.
    if (res.status === 401 && path.startsWith("/api/admin")) {
      message = "Your session has expired. Please sign in again.";
    }
    throw new ApiError(message, res.status);
  }

  return res;
}

/** Fetch a single-resource endpoint, unwrapping `{ success, data }`. */
export async function fetchOne<T>(path: string, options?: FetchOptions): Promise<T> {
  const res = await request(path, options);
  const envelope = (await res.json()) as ApiEnvelope<T>;
  return envelope.data;
}

/** Fetch a list endpoint, unwrapping `{ success, data, pagination }`. */
export async function fetchList<T>(path: string, options?: FetchOptions): Promise<T[]> {
  const res = await request(path, options);
  const envelope = (await res.json()) as ApiListEnvelope<T>;
  return envelope.data ?? [];
}

/** Fetch a list endpoint, keeping pagination metadata for admin tables. */
export async function fetchPage<T>(
  path: string,
  options?: FetchOptions
): Promise<{ data: T[]; pagination?: import("@/types/api").Pagination }> {
  const res = await request(path, options);
  const envelope = (await res.json()) as ApiListEnvelope<T>;
  return { data: envelope.data ?? [], pagination: envelope.pagination };
}

export async function postOne<TBody, TResponse>(
  path: string,
  body: TBody
): Promise<TResponse> {
  const res = await request(path, { method: "POST", body, cache: "no-store" });
  const envelope = (await res.json()) as ApiEnvelope<TResponse>;
  return envelope.data;
}

export async function patchOne<TBody, TResponse>(
  path: string,
  body: TBody
): Promise<TResponse> {
  const res = await request(path, { method: "PATCH", body, cache: "no-store" });
  const envelope = (await res.json()) as ApiEnvelope<TResponse>;
  return envelope.data;
}

/** For endpoints that respond 204 No Content (deletes, logout). */
export async function requestVoid(path: string, method: "POST" | "DELETE" = "DELETE"): Promise<void> {
  await request(path, { method, cache: "no-store" });
}
