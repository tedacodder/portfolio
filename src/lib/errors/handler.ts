import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { AppError } from "./app-error";
import { logger } from "../utils/logger";

// Every route handler wraps its logic with this so error formatting,
// status codes, and logging stay in exactly one place (requirement: a
// consistent error handler for API routes, and no leaking of database
// errors / stack traces to clients).
export function withErrorHandler<Args extends unknown[]>(
  fn: (...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    logger.warn("validation_error", { issues: error.issues });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request",
          // Zod 4 replaced the ZodError#flatten() instance method with a
          // top-level helper.
          details: z.flattenError(error),
        },
      },
      { status: 422 },
    );
  }

  if (error instanceof AppError) {
    // Only 5xx-level AppErrors are logged as errors; 4xx are expected
    // client-caused outcomes and logged at a lower level to avoid noise.
    if (error.statusCode >= 500) {
      logger.error("app_error", { message: error.message, code: error.code });
    } else {
      logger.warn("app_error", { message: error.message, code: error.code });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode },
    );
  }

  // Unknown/unexpected error: never leak internals (stack trace, DB error
  // text, etc.) to the client. Log the real error server-side instead.
  logger.error("unhandled_error", {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: 500 },
  );
}
