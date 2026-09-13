import type { NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "portfolio_session";
export const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS ?? 60 * 60 * 24 * 7);

/**
 * Sets the session cookie with production-safe attributes:
 * httpOnly (never readable by client JS -> no localStorage token storage),
 * secure in production (HTTPS only), sameSite=lax (CSRF mitigation while
 * still allowing top-level navigation links to work).
 */
export function setSessionCookie(response: NextResponse, sessionId: string): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
