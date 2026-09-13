import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and configure a PostgreSQL connection string.",
  );
}

// A single shared connection pool for the whole app. In serverless/edge
// deployments you would typically cap `max` low (or use a pooler like
// PgBouncer / Neon's pooled connection string); for a typical Node runtime
// deployment a modest pool is fine.
const queryClient = postgres(process.env.DATABASE_URL, {
  max: 10,
  // Fail fast if Postgres is unreachable, rather than hanging — without
  // this, an unreachable/misconfigured DATABASE_URL can hang each query
  // for a long time (OS-level TCP timeout), which is especially painful
  // during `next build`'s page-data-collection phase, where a single
  // hung query can stall or fail the entire build.
  connect_timeout: 10,
});

export const db = drizzle(queryClient, { schema });

export type Database = typeof db;
