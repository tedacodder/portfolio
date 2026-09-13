// The `postgres` driver attaches a Postgres error `code` to thrown errors.
// 23503 = foreign_key_violation, 23505 = unique_violation. Checking these
// lets services turn low-level DB constraint failures into the same
// ConflictError shape used everywhere else, instead of leaking a raw
// database error message to the client.
interface PostgresErrorLike {
  code?: string;
}

function getPgCode(error: unknown): string | undefined {
  return (error as PostgresErrorLike | undefined)?.code;
}

export function isForeignKeyViolation(error: unknown): boolean {
  return getPgCode(error) === "23503";
}

export function isUniqueViolation(error: unknown): boolean {
  return getPgCode(error) === "23505";
}
