import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and configure a PostgreSQL connection string.",
  );
}

// Dev-mode HMR guard: every time Next.js/Turbopack invalidates and
// re-evaluates this module (which happens on essentially every save
// anywhere in its import graph — i.e. almost any admin/service/schema
// file — during `next dev`), the code below would otherwise run again
// and open a *brand new* connection pool without ever closing the
// previous one. Those old pools are never garbage collected (postgres-js
// keeps their sockets alive) and their connections stay checked out, so
// repeated edits during a dev session quietly accumulate zombie
// connections until the pool/server has no free slot left. At that
// point any request that needs more than one or two concurrent
// connections — like `/admin`, whose layout (session lookup) and page
// (`Promise.allSettled` over four service calls, several of which run
// their own internal `Promise.all`) can need five or more connections
// at once — queues forever waiting for a slot that never frees up,
// which is exactly the "no HTTP response, ever" symptom, while a
// single simple query (or a one-off script with its own fresh pool)
// still slips through. Caching the client on `globalThis` makes Fast
// Refresh reuse the existing pool instead of leaking a new one.
declare global {
  // eslint-disable-next-line no-var
  var __dbQueryClient: ReturnType<typeof postgres> | undefined;
}

// A single shared connection pool for the whole app. In serverless/edge
// deployments you would typically cap `max` low (or use a pooler like
// PgBouncer / Neon's pooled connection string); for a typical Node runtime
// deployment a modest pool is fine.
const queryClient =
  globalThis.__dbQueryClient ??
  postgres(process.env.DATABASE_URL, {
    max: 10,
    // Fail fast if Postgres is unreachable, rather than hanging — without
    // this, an unreachable/misconfigured DATABASE_URL can hang each query
    // for a long time (OS-level TCP timeout), which is especially painful
    // during `next build`'s page-data-collection phase, where a single
    // hung query can stall or fail the entire build.
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__dbQueryClient = queryClient;
}

export const db = drizzle(queryClient, { schema });

export type Database = typeof db;