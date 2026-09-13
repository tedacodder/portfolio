import { RateLimitError } from "../errors/app-error";

// In-memory fixed-window rate limiter. This is sufficient for a
// single-instance deployment (or as a first line of defense in front of a
// CDN/WAF); for a multi-instance deployment, back this with Redis instead
// (the interface below is deliberately narrow, so swapping the storage is a
// one-file change).
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Unique key for the thing being limited, e.g. `contact:203.0.113.4`. */
  key: string;
  /** Max requests allowed within the window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

/**
 * Throws RateLimitError if the caller has exceeded `limit` requests within
 * the current window for the given key. Otherwise increments the counter.
 */
export function enforceRateLimit({ key, limit, windowMs }: RateLimitOptions): void {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (existing.count >= limit) {
    throw new RateLimitError();
  }

  existing.count += 1;
}

/** Best-effort client identifier for rate limiting, from standard proxy headers. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
