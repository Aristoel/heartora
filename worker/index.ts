export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  VITE_STRIPE_PUBLISHABLE_KEY: string;
}

const SESSION_DAYS = 7;
const PASSWORD_ITERATIONS = 100000;
const SESSION_COOKIE = "__Host-heartora_session";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://heartora.jimdemare3.workers.dev",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }

  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function randomId(): string {
  return crypto.randomUUID();
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  if (!/^(?:[0-9a-f]{2})+$/i.test(hex)) {
    throw new Error("Invalid hexadecimal value");
  }

  const result = new Uint8Array(hex.length / 2);

  for (let i = 0; i < result.length; i++) {
    result[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }

  return result;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return base64UrlEncode(bytes);
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return bytesToHex(new Uint8Array(digest));
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PASSWORD_ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256,
  );

  return [
    "pbkdf2-sha256",
    String(PASSWORD_ITERATIONS),
    bytesToHex(salt),
    bytesToHex(new Uint8Array(derived)),
  ].join("$");
}

async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  try {
    const parts = storedHash.split("$");

    if (
      parts.length !== 4 ||
      parts[0] !== "pbkdf2-sha256" ||
      parts[1] !== String(PASSWORD_ITERATIONS)
    ) {
      return false;
    }

    const salt = hexToBytes(parts[2]);
    const expected = hexToBytes(parts[3]);

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"],
    );

    const derived = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: PASSWORD_ITERATIONS,
        hash: "SHA-256",
      },
      key,
      256,
    );

    const actual = new Uint8Array(derived);

    if (actual.length !== expected.length) {
      return false;
    }

    let difference = 0;

    for (let i = 0; i < actual.length; i++) {
      difference |= actual[i] ^ expected[i];
    }

    return difference === 0;
  } catch {
    return false;
  }
}

function sessionCookie(token: string, maxAge: number): string {
  return [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ].join("; ");
}

function clearSessionCookie(): string {
  return [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
}

function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get("Cookie");

  if (!cookieHeader) {
    return null;
  }

  for (const item of cookieHeader.split(";")) {
    const separator = item.indexOf("=");

    if (separator < 0) {
      continue;
    }

    const name = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();

    if (name === SESSION_COOKIE) {
      return /^[A-Za-z0-9_-]{40,60}$/.test(value)
        ? value
        : null;
    }
  }

  return null;
}

function validEmail(email: string): boolean {
  return (
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function calculateAge(dateString: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return -1;
  }

  const birth = new Date(`${dateString}T00:00:00.000Z`);

  if (
    Number.isNaN(birth.getTime()) ||
    birth.toISOString().slice(0, 10) !== dateString
  ) {
    return -1;
  }

  const now = new Date();

  if (birth.getTime() > now.getTime()) {
    return -1;
  }

  let age = now.getUTCFullYear() - birth.getUTCFullYear();

  if (
    now.getUTCMonth() < birth.getUTCMonth() ||
    (
      now.getUTCMonth() === birth.getUTCMonth() &&
      now.getUTCDate() < birth.getUTCDate()
    )
  ) {
    age--;
  }

  return age;
}

function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("Origin");

  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

async function createSession(
  env: Env,
  userId: string,
): Promise<{ token: string; maxAge: number }> {
  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  const maxAge = SESSION_DAYS * 24 * 60 * 60 * 1000;

  const expiresAt = new Date(Date.now() + maxAge).toISOString();

  await env.DB.prepare(
    `INSERT INTO user_sessions
      (id, user_id, token_hash, expires_at)
     VALUES (?, ?, ?, ?)`,
  )
    .bind(randomId(), userId, tokenHash, expiresAt)
    .run();

  return {
    token,
    maxAge: Math.floor(maxAge / 1000),
  };
}

async function currentUser(
  request: Request,
  env: Env,
): Promise<{
  id: string;
  email: string;
  display_name: string;
  country: string;
} | null> {
  const token = getSessionToken(request);

  if (!token) {
    return null;
  }

  const tokenHash = await sha256Hex(token);

  const session = await env.DB.prepare(
    `SELECT u.id, u.email, u.display_name, u.country
     FROM user_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?
       AND s.expires_at > ?
     LIMIT 1`,
  )
    .bind(tokenHash, new Date().toISOString())
    .first<{
      id: string;
      email: string;
      display_name: string;
      country: string;
    }>();

  return session ?? null;
}

async function handleSignup(
  request: Request,
  env: Env,
): Promise<Response> {
  if (!isSameOriginRequest(request)) {
    return json({ success: false, error: "Request origin rejected." }, 403);
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return json({ success: false, error: "Invalid JSON request." }, 400);
  }

  const fullName = typeof body.fullName === "string"
    ? body.fullName.trim()
    : "";

  const displayName = typeof body.displayName === "string"
    ? body.displayName.trim()
    : "";

  const email = typeof body.email === "string"
    ? body.email.trim().toLowerCase()
    : "";

  const password = typeof body.password === "string"
    ? body.password
    : "";

  const birthDate = typeof body.birthDate === "string"
    ? body.birthDate
    : "";

  const country = typeof body.country === "string"
    ? body.country.trim()
    : "";

  const postalCode = typeof body.postalCode === "string"
    ? body.postalCode.trim()
    : "";

  if (
    !fullName ||
    fullName.length > 100 ||
    !displayName ||
    displayName.length > 40 ||
    !validEmail(email) ||
    password.length < 8 ||
    new TextEncoder().encode(password).length > 1024 ||
    !country ||
    country.length > 100 ||
    !postalCode ||
    postalCode.length > 20
  ) {
    return json({
      success: false,
      error: "Please check your details and try again.",
    }, 400);
  }

  if (calculateAge(birthDate) < 18) {
    return json({
      success: false,
      error: "Heartora is only available to adults aged 18 and over.",
    }, 400);
  }

  try {
    const existing = await env.DB.prepare(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
    )
      .bind(email)
      .first<{ id: string }>();

    if (existing) {
      return json({
        success: false,
        error: "An account with that email address may already exist.",
      }, 409);
    }

    const passwordHash = await hashPassword(password);
    const userId = randomId();

    await env.DB.prepare(
      `INSERT INTO users
        (id, email, password_hash, display_name, date_of_birth, country, postal_code)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        userId,
        email,
        passwordHash,
        displayName,
        birthDate,
        country,
        postalCode,
      )
      .run();

    const session = await createSession(env, userId);

    const response = json({
      success: true,
      message: "Your Heartora account has been created.",
      user: {
        id: userId,
        email,
        displayName,
        country,
      },
    }, 201);

    response.headers.set(
      "Set-Cookie",
      sessionCookie(session.token, session.maxAge),
    );

    return response;
  } catch (error) {
    console.error("Heartora registration failed:", error);

    return json({
      success: false,
      error: "We couldn't create your account. Please try again.",
    }, 500);
  }
}

async function handleSignin(
  request: Request,
  env: Env,
): Promise<Response> {
  if (!isSameOriginRequest(request)) {
    return json({ success: false, error: "Request origin rejected." }, 403);
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return json({ success: false, error: "Invalid JSON request." }, 400);
  }

  const email = typeof body.email === "string"
    ? body.email.trim().toLowerCase()
    : "";

  const password = typeof body.password === "string"
    ? body.password
    : "";

  if (!validEmail(email) || !password || password.length > 1024) {
    return json({
      success: false,
      error: "Invalid email or password.",
    }, 400);
  }

  try {
    const user = await env.DB.prepare(
      `SELECT id, email, password_hash, display_name, country
       FROM users
       WHERE email = ?
       LIMIT 1`,
    )
      .bind(email)
      .first<{
        id: string;
        email: string;
        password_hash: string;
        display_name: string;
        country: string;
      }>();

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return json({
        success: false,
        error: "Invalid email or password.",
      }, 401);
    }

    const session = await createSession(env, user.id);

    const response = json({
      success: true,
      message: "You are signed in.",
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        country: user.country,
      },
    });

    response.headers.set(
      "Set-Cookie",
      sessionCookie(session.token, session.maxAge),
    );

    return response;
  } catch (error) {
    console.error("Heartora sign-in failed:", error);

    return json({
      success: false,
      error: "Unable to sign in right now. Please try again.",
    }, 500);
  }
}

async function handleMe(
  request: Request,
  env: Env,
): Promise<Response> {
  try {
    const user = await currentUser(request, env);

    if (!user) {
      return json({
        success: false,
        error: "Your session is missing or has expired.",
      }, 401);
    }

    return json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        country: user.country,
      },
    });
  } catch (error) {
    console.error("Heartora session validation failed:", error);

    return json({
      success: false,
      error: "Unable to validate your session.",
    }, 500);
  }
}

async function handleSignout(
  request: Request,
  env: Env,
): Promise<Response> {
  if (!isSameOriginRequest(request)) {
    return json({ success: false, error: "Request origin rejected." }, 403);
  }

  try {
    const token = getSessionToken(request);

    if (token) {
      const tokenHash = await sha256Hex(token);

      await env.DB.prepare(
        "DELETE FROM user_sessions WHERE token_hash = ?",
      )
        .bind(tokenHash)
        .run();
    }

    const response = json({
      success: true,
      message: "You have been signed out.",
    });

    response.headers.set("Set-Cookie", clearSessionCookie());

    return response;
  } catch (error) {
    console.error("Heartora sign-out failed:", error);

    const response = json({
      success: false,
      error: "Unable to sign out right now.",
    }, 500);

    response.headers.set("Set-Cookie", clearSessionCookie());

    return response;
  }
}
const HEARTORA_STRIPE_PRICES = new Set([
  "price_1UQwm1D4sEidTZkrl2sXAmYo",
  "price_1UQwoDD4sEidTZkrDYJq8CRJ",
  "price_1UQwvxD4sEidTZkriAaZ5uMN",
]);

async function handleCreateCheckout(
  request: Request,
  env: Env,
): Promise<Response> {
  if (!isSameOriginRequest(request)) {
    return json({
      success: false,
      error: "Request origin rejected.",
    }, 403);
  }

  if (
    !request.headers
      .get("Content-Type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    return json({
      success: false,
      error: "Content-Type must be application/json.",
    }, 415);
  }

  const user = await currentUser(request, env);

  if (!user) {
    return json({
      success: false,
      error: "Please sign in before subscribing.",
    }, 401);
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return json({
      success: false,
      error: "Invalid JSON request.",
    }, 400);
  }

  const priceId =
    typeof body.priceId === "string" ? body.priceId : "";

  if (!HEARTORA_STRIPE_PRICES.has(priceId)) {
    return json({
      success: false,
      error: "Please select a valid Heartora subscription plan.",
    }, 400);
  }

  const origin = new URL(request.url).origin;

  const form = new URLSearchParams();

  form.set("ui_mode", "embedded_page");
  form.set("mode", "subscription");
  form.set("line_items[0][price]", priceId);
  form.set("line_items[0][quantity]", "1");
  form.set("customer_email", user.email);
  form.set("client_reference_id", user.id);
  form.set("metadata[user_id]", user.id);
  form.set("subscription_data[metadata][user_id]", user.id);
  form.set(
    "return_url",
    `${origin}/premium?session_id={CHECKOUT_SESSION_ID}`,
  );

  try {
    const stripeResponse = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      },
    );

    const stripeData = await stripeResponse.json() as {
      id?: string;
      client_secret?: string;
      error?: {
        message?: string;
        type?: string;
      };
    };

    if (
      !stripeResponse.ok ||
      typeof stripeData.client_secret !== "string"
    ) {
      
    console.error("Stripe checkout session creation failed:", {
  status: stripeResponse.status,
  type: stripeData.error?.type,
  message: stripeData.error?.message,
  param: (stripeData.error as { param?: string } | undefined)?.param,
});

      return json({
        success: false,
        error: "We couldn't start checkout. Please try again.",
      }, 502);
    }

    return json({
      success: true,
      clientSecret: stripeData.client_secret,
    });
  } catch (error) {
    console.error("Stripe checkout request failed:", error);

    return json({
      success: false,
      error: "Unable to connect to the payment service.",
    }, 502);
  }
                  }
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      if (!isSameOriginRequest(request)) {
        return json({ success: false, error: "Request origin rejected." }, 403);
      }

      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    if (url.pathname.startsWith("/api/auth/")) {
      if (
        request.method === "POST" &&
        url.pathname !== "/api/auth/signout" &&
        !request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")
      ) {
        return json({
          success: false,
          error: "Content-Type must be application/json.",
        }, 415);
      }

      if (url.pathname === "/api/auth/signup" && request.method === "POST") {
        return handleSignup(request, env);
      }

      if (url.pathname === "/api/auth/signin" && request.method === "POST") {
        return handleSignin(request, env);
      }

      if (url.pathname === "/api/auth/me" && request.method === "GET") {
        return handleMe(request, env);
      }

      if (url.pathname === "/api/auth/signout" && request.method === "POST") {
        return handleSignout(request, env);
      }

      return json({
        success: false,
        error: "Authentication endpoint not found or method not allowed.",
      }, 404);
    }

    if (url.pathname === "/api/health") {
      if (request.method !== "GET") {
        return json({ success: false, error: "Method not allowed" }, 405);
      }

      return json({
        success: true,
        app: "Heartora",
        status: "online",
      });
    }
    if (url.pathname === "/api/stripe/checkout") {
      if (request.method !== "POST") {
        return json({
          success: false,
          error: "Method not allowed.",
        }, 405);
      }

      return handleCreateCheckout(request, env);
    }
    if (url.pathname === "/api/db-health") {
      if (request.method !== "GET") {
        return json({ success: false, error: "Method not allowed" }, 405);
      }

      try {
        const result = await env.DB
          .prepare("SELECT 1 AS connected")
          .first<{ connected: number }>();

        if (result?.connected !== 1) {
          return json({
            success: false,
            database: "unknown",
            error: "The database did not return the expected result.",
          }, 500);
        }

        return json({
          success: true,
          app: "Heartora",
          database: "connected",
        });
      } catch (error) {
        console.error("Heartora database health check failed:", error);

        return json({
          success: false,
          database: "error",
          error: "Database query failed. Check the D1 binding and database configuration.",
        }, 500);
      }
    }

    if (request.method === "GET" || request.method === "HEAD") {
      try {
        return withCors(await env.ASSETS.fetch(request));
      } catch (error) {
        console.error("Heartora frontend request failed:", error);

        return json({
          success: false,
          error: "Unable to load the Heartora website.",
        }, 500);
      }
    }

    return json({
      success: false,
      error: "API endpoint not found",
    }, 404);
  },
};
