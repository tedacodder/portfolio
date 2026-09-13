import { beforeAll, describe, expect, it } from "vitest";

const hasDb = Boolean(process.env.DATABASE_URL);

// These exercise the actual route handlers (not just the service layer) to
// verify that admin endpoints reject unauthenticated requests. Next.js
// route handlers are plain functions of (Request) => Promise<Response>, so
// they can be invoked directly in tests without spinning up a server.
describe.skipIf(!hasDb)("authorization (integration)", () => {
  beforeAll(async () => {
    // next/headers' cookies() reads from the request-scoped store that only
    // exists inside a real Next.js request. Outside of that, calling
    // requireAdmin() with no cookie present still works correctly here
    // because there is no session cookie to find — it resolves to
    // "not authenticated" either way, which is exactly the case under test.
  });

  it("rejects GET /api/admin/projects with no session", async () => {
    const { GET } = await import("@/app/api/admin/projects/route");
    const request = new Request("http://localhost/api/admin/projects");
    const response = await GET(request as unknown as import("next/server").NextRequest);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("AUTHENTICATION_ERROR");
  });

  it("rejects POST /api/admin/articles with no session", async () => {
    const { POST } = await import("@/app/api/admin/articles/route");
    const request = new Request("http://localhost/api/admin/articles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "x", content: "y" }),
    });
    const response = await POST(request as unknown as import("next/server").NextRequest);
    expect(response.status).toBe(401);
  });

  it("rejects DELETE /api/admin/technologies/:id with no session", async () => {
    const { DELETE } = await import("@/app/api/admin/technologies/[id]/route");
    const request = new Request("http://localhost/api/admin/technologies/123e4567-e89b-12d3-a456-426614174000", {
      method: "DELETE",
    });
    const response = await DELETE(request as unknown as import("next/server").NextRequest, {
      params: Promise.resolve({ id: "123e4567-e89b-12d3-a456-426614174000" }),
    });
    expect(response.status).toBe(401);
  });

  it("public GET /api/projects works without any session", async () => {
    const { GET } = await import("@/app/api/projects/route");
    const request = new Request("http://localhost/api/projects");
    const response = await GET(request as unknown as import("next/server").NextRequest);
    expect(response.status).toBe(200);
  });
});
