export interface Env {
  DB: D1Database;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname === "/api/health") {
      return json({
        success: true,
        app: "Heartora",
        status: "online",
      });
    }

    if (url.pathname === "/api/db-health") {
      try {
        const result = await env.DB
          .prepare("SELECT 1 AS connected")
          .first<{ connected: number }>();

        return json({
          success: true,
          database: result?.connected === 1 ? "connected" : "unknown",
        });
      } catch {
        return json({
          success: false,
          error: "Database query failed. Check the D1 binding.",
        }, 500);
      }
    }

    return json({
      success: false,
      error: "API endpoint not found",
    }, 404);
  },
};
