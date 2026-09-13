// Minimal structured logger. Writes newline-delimited JSON, which is easy
// to ship to any log aggregator later without changing call sites.
// Deliberately never receives passwords, session secrets, cookies, or
// message bodies — callers are responsible for only passing safe fields
// (enforced by convention/review, since a generic logger cannot know which
// field names are sensitive in every future call site).
type LogLevel = "info" | "warn" | "error";

function write(level: LogLevel, event: string, fields?: Record<string, unknown>) {
  const line = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...fields,
  };
  const serialized = JSON.stringify(line);
  if (level === "error") {
    console.error(serialized);
  } else if (level === "warn") {
    console.warn(serialized);
  } else {
    console.log(serialized);
  }
}

export const logger = {
  info: (event: string, fields?: Record<string, unknown>) => write("info", event, fields),
  warn: (event: string, fields?: Record<string, unknown>) => write("warn", event, fields),
  error: (event: string, fields?: Record<string, unknown>) => write("error", event, fields),
};

// Wraps a route handler to log method, route, status, and duration for
// every request — the "basic structured logging strategy" requirement.
export function withRequestLogging<Args extends unknown[]>(
  routeLabel: string,
  fn: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args): Promise<Response> => {
    const start = Date.now();
    const request = args[0] as Request | undefined;
    const method = request?.method ?? "UNKNOWN";
    let status = 500;
    try {
      const response = await fn(...args);
      status = response.status;
      return response;
    } finally {
      logger.info("request", {
        method,
        route: routeLabel,
        status,
        durationMs: Date.now() - start,
      });
    }
  };
}
