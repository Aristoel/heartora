export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
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

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle browser preflight requests.
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // API health check.
    if (url.pathname === "/api/health") {
      if (request.method !== "GET") {
        return json(
          {
            success: false,
            error: "Method not allowed",
          },
          405,
        );
      }

      return json({
        success: true,
        app: "Heartora",
        status: "online",
      });
    }

    // Database connection health check.
    if (url.pathname === "/api/db-health") {
      if (request.method !== "GET") {
        return json(
          {
            success: false,
            error: "Method not allowed",
          },
          405,
        );
      }

      try {
        if (!env.DB) {
          return json(
            {
              success: false,
              database: "unavailable",
              error: "The D1 binding DB is not configured.",
            },
            500,
          );
        }

        const result = await env.DB
          .prepare("SELECT 1 AS connected")
          .first<{ connected: number }>();

        if (result?.connected !== 1) {
          return json(
            {
              success: false,
              database: "unknown",
              error: "The database did not return the expected result.",
            },
            500,
          );
        }

        return json({
          success: true,
          app: "Heartora",
          database: "connected",
        });
      } catch (error) {
        console.error("Heartora database health check failed:", error);

        return json(
          {
            success: false,
            database: "error",
            error: "Database query failed. Check the D1 binding and database configuration.",
          },
          500,
        );
      }
    }

    // Serve the frontend for normal website requests.
    if (
      request.method === "GET" ||
      request.method === "HEAD"
    ) {
      try {
        if (!env.ASSETS) {
          return json(
            {
              success: false,
              error: "The frontend ASSETS binding is not configured.",
            },
            500,
          );
        }

        return withCors(await env.ASSETS.fetch(request));
      } catch (error) {
        console.error("Heartora frontend request failed:", error);

        return json(
          {
            success: false,
            error: "Unable to load the Heartora website.",
          },
          500,
        );
      }
    }

    // Unknown API routes and unsupported methods.
    return json(
      {
        success: false,
        error: "API endpoint not found",
      },
      404,
    );
  },
};
