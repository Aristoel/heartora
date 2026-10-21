export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  PHOTOS: R2Bucket;

  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  VITE_STRIPE_PUBLISHABLE_KEY: string;
  ADMIN_EMAIL: string;
}

const SESSION_DAYS = 7;
const PASSWORD_ITERATIONS = 100000;
const SESSION_COOKIE = "__Host-heartora_session";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://heartora.jimdemare3.workers.dev",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
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
async function requireAdmin(
  request: Request,
  env: Env,
): Promise<{
  id: string;
  email: string;
  display_name: string;
  country: string;
} | null> {
  const user = await currentUser(request, env);

  if (!user) {
    return null;
  }

  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!adminEmail || user.email.toLowerCase() !== adminEmail) {
    return null;
  }

  return user;
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

async function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
): Promise<boolean> {
  const parts = signatureHeader.split(",");

  const timestampPart = parts.find((part) =>
    part.startsWith("t=")
  );

  const signatureParts = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestampPart || signatureParts.length === 0) {
    return false;
  }

  const timestamp = Number(timestampPart.slice(2));

  if (
    !Number.isSafeInteger(timestamp) ||
    Math.abs(Date.now() / 1000 - timestamp) > 300
  ) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload),
  );

  const expected = bytesToHex(new Uint8Array(digest));

  return signatureParts.some((signature) => {
    if (!/^[0-9a-f]{64}$/i.test(signature)) {
      return false;
    }

    let difference = 0;

    for (let i = 0; i < expected.length; i++) {
      difference |=
        expected.charCodeAt(i) ^
        signature.toLowerCase().charCodeAt(i);
    }

    return difference === 0;
  });
}

async function handleStripeWebhook(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "POST") {
    return json(
      {
        success: false,
        error: "Method not allowed.",
      },
      405,
    );
  }

  const signature = request.headers.get("Stripe-Signature");

  if (!signature) {
    return json(
      {
        success: false,
        error: "Missing Stripe signature.",
      },
      400,
    );
  }

  // Read the raw payload so Stripe's signature can be verified.
  const payload = await request.text();

  let verified: boolean;

  try {
    verified = await verifyStripeSignature(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error(
      "Stripe webhook signature verification failed:",
      error,
    );

    return json(
      {
        success: false,
        error: "Unable to verify webhook signature.",
      },
      400,
    );
  }

  if (!verified) {
    return json(
      {
        success: false,
        error: "Invalid Stripe signature.",
      },
      400,
    );
  }

  // Parse the verified Stripe event.
  let event: {
    id?: string;
    type?: string;
    data?: {
      object?: Record<string, unknown>;
    };
  };

  try {
    event = JSON.parse(payload) as typeof event;
  } catch {
    return json(
      {
        success: false,
        error: "Invalid webhook payload.",
      },
      400,
    );
  }

  if (!event.id || !event.type || !event.data?.object) {
    return json(
      {
        success: false,
        error: "Incomplete webhook event.",
      },
      400,
    );
  }

  const eventId = event.id;
  const eventType = event.type;
  const object = event.data.object;

  // Avoid processing events that have already succeeded.
  try {
    const processed = await env.DB.prepare(
      `SELECT event_id
       FROM stripe_webhook_events
       WHERE event_id = ?
       LIMIT 1`,
    )
      .bind(eventId)
      .first<{ event_id: string }>();

    if (processed) {
      return json({
        success: true,
        received: true,
        duplicate: true,
      });
    }
  } catch (error) {
    console.error("Stripe event lookup failed:", error);

    return json(
      {
        success: false,
        error: "Unable to check webhook event history.",
      },
      500,
    );
  }

  const subscriptionEvents = new Set([
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
  ]);

  try {
    /*
     * CHECKOUT COMPLETED
     *
     * The checkout event confirms that the checkout completed.
     * The subscription lifecycle events below are responsible
     * for saving the subscription status in D1.
     *
     * Do not return early; record this event after handling it.
     */
    if (eventType === "checkout.session.completed") {
      const checkoutMode =
        typeof object.mode === "string"
          ? object.mode
          : "";

      if (checkoutMode === "subscription") {
        const paymentStatus =
          typeof object.payment_status === "string"
            ? object.payment_status
            : "";

        console.log("Stripe subscription checkout completed.", {
          eventId,
          paymentStatus,
        });
      }
    }

    /*
     * SUBSCRIPTION CREATED, UPDATED, OR DELETED
     */
    else if (subscriptionEvents.has(eventType)) {
      const metadata =
        object.metadata &&
        typeof object.metadata === "object"
          ? object.metadata as Record<string, unknown>
          : {};

      let userId =
        typeof metadata.user_id === "string"
          ? metadata.user_id
          : null;

      const subscriptionId =
        typeof object.id === "string"
          ? object.id
          : null;

      const customerId =
        typeof object.customer === "string"
          ? object.customer
          : object.customer &&
              typeof object.customer === "object" &&
              typeof (
                object.customer as Record<string, unknown>
              ).id === "string"
            ? String(
                (object.customer as Record<string, unknown>).id,
              )
            : null;

      if (!subscriptionId) {
        console.error(
          "Subscription event is missing its subscription ID.",
          { eventId, eventType },
        );

        return json(
          {
            success: false,
            error: "Subscription ID is missing.",
          },
          500,
        );
      }

      // Recover the Heartora user ID if metadata is unavailable.
      if (!userId) {
        const existingBySubscription = await env.DB.prepare(
          `SELECT user_id
           FROM user_subscriptions
           WHERE stripe_subscription_id = ?
           LIMIT 1`,
        )
          .bind(subscriptionId)
          .first<{ user_id: string }>();

        userId = existingBySubscription?.user_id ?? null;
      }

      if (!userId) {
        console.error(
          "Could not match Stripe subscription to a Heartora user.",
          { eventId, eventType, subscriptionId },
        );

        // Return a failure so Stripe can retry delivery.
        return json(
          {
            success: false,
            error: "Subscription user could not be matched.",
          },
          500,
        );
      }

      const stripeStatus =
        typeof object.status === "string"
          ? object.status
          : "inactive";

      const cancelAtPeriodEnd =
        object.cancel_at_period_end === true ? 1 : 0;

      const periodEndSeconds =
        typeof object.current_period_end === "number"
          ? object.current_period_end
          : null;

      const currentPeriodEnd =
        periodEndSeconds !== null
          ? new Date(periodEndSeconds * 1000).toISOString()
          : null;

      const items = object.items as
        | {
            data?: Array<{
              price?: {
                id?: string;
              };
            }>;
          }
        | undefined;

      const priceId =
        typeof items?.data?.[0]?.price?.id === "string"
          ? items.data[0].price.id
          : null;

      const existingByUser = await env.DB.prepare(
        `SELECT id
         FROM user_subscriptions
         WHERE user_id = ?
         LIMIT 1`,
      )
        .bind(userId)
        .first<{ id: string }>();

      if (existingByUser) {
        await env.DB.prepare(
          `UPDATE user_subscriptions
           SET stripe_customer_id =
                 COALESCE(?, stripe_customer_id),
               stripe_subscription_id = ?,
               stripe_price_id =
                 COALESCE(?, stripe_price_id),
               status = ?,
               current_period_end = ?,
               cancel_at_period_end = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ?`,
        )
          .bind(
            customerId,
            subscriptionId,
            priceId,
            stripeStatus,
            currentPeriodEnd,
            cancelAtPeriodEnd,
            userId,
          )
          .run();
      } else {
        await env.DB.prepare(
          `INSERT INTO user_subscriptions (
             id,
             user_id,
             stripe_customer_id,
             stripe_subscription_id,
             stripe_price_id,
             status,
             current_period_end,
             cancel_at_period_end
           )
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(
            randomId(),
            userId,
            customerId,
            subscriptionId,
            priceId,
            stripeStatus,
            currentPeriodEnd,
            cancelAtPeriodEnd,
          )
          .run();
      }

      console.log("Heartora subscription synchronized.", {
        eventId,
        eventType,
        userId,
        subscriptionId,
        status: stripeStatus,
      });
    }

    /*
     * PAYMENT FAILED
     */
    else if (eventType === "invoice.payment_failed") {
      const subscriptionValue = object.subscription;

      const subscriptionId =
        typeof subscriptionValue === "string"
          ? subscriptionValue
          : subscriptionValue &&
              typeof subscriptionValue === "object" &&
              typeof (
                subscriptionValue as Record<string, unknown>
              ).id === "string"
            ? String(
                (subscriptionValue as Record<string, unknown>).id,
              )
            : null;

      if (subscriptionId) {
        await env.DB.prepare(
          `UPDATE user_subscriptions
           SET status = 'past_due',
               updated_at = CURRENT_TIMESTAMP
           WHERE stripe_subscription_id = ?`,
        )
          .bind(subscriptionId)
          .run();
      } else {
        console.warn(
          "Payment-failed event has no subscription ID.",
          { eventId },
        );
      }
    }

    /*
     * PAYMENT SUCCEEDED
     *
     * Do not independently grant premium access based only
     * on this event. Subscription status is synchronized above.
     */
    else if (eventType === "invoice.paid") {
      console.log("Stripe invoice paid.", { eventId });
    }

    /*
     * Other events are acknowledged and recorded.
     */

    // Record the event only after its processing has succeeded.
    await env.DB.prepare(
      `INSERT OR IGNORE INTO stripe_webhook_events
         (event_id, event_type)
       VALUES (?, ?)`,
    )
      .bind(eventId, eventType)
      .run();

    return json({
      success: true,
      received: true,
    });
  } catch (error) {
    console.error("Stripe webhook processing failed:", {
      eventId,
      eventType,
      error,
    });

    // A non-2xx response allows Stripe to retry.
    return json(
      {
        success: false,
        error: "Webhook processing failed.",
      },
      500,
    );
  }
      }
        
async function handleProfilePhotos(
  request: Request,
  env: Env,
  photoId?: string,
): Promise<Response> {
  const user = await currentUser(request, env);

  if (!user) {
    return json({
      success: false,
      error: "Please sign in to manage your photos.",
    }, 401);
  }

  if (
    request.method !== "GET" &&
    !isSameOriginRequest(request)
  ) {
    return json({
      success: false,
      error: "Request origin rejected.",
    }, 403);
  }

  const MAX_PHOTOS = 8;
  const MAX_SIZE = 5 * 1024 * 1024;

  const allowedTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

  try {
    // VIEW A PHOTO
    if (request.method === "GET" && photoId) {
      const photo = await env.DB.prepare(`
        SELECT
          p.id,
          p.user_id,
          p.object_key,
          p.content_type,
          mp.show_in_discovery
        FROM member_photos p
        JOIN member_profiles mp ON mp.user_id = p.user_id
        WHERE p.id = ?
        LIMIT 1
      `)
        .bind(photoId)
        .first<{
          id: string;
          user_id: string;
          object_key: string;
          content_type: string;
          show_in_discovery: number;
        }>();

      if (
        !photo ||
        (
          photo.user_id !== user.id &&
          photo.show_in_discovery !== 1
        )
      ) {
        return json({
          success: false,
          error: "Photo not found.",
        }, 404);
      }

      const object = await env.PHOTOS.get(photo.object_key);

      if (!object) {
        return json({
          success: false,
          error: "Photo file not found.",
        }, 404);
      }

      return new Response(object.body, {
        headers: {
          "Content-Type": photo.content_type,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'none'",
          "Content-Disposition": "inline",
          ...CORS_HEADERS,
        },
      });
    }

    // LIST THE SIGNED-IN MEMBER'S PHOTOS
    if (request.method === "GET") {
      const result = await env.DB.prepare(`
        SELECT id, content_type, size_bytes, is_primary, created_at
        FROM member_photos
        WHERE user_id = ?
        ORDER BY is_primary DESC, created_at DESC
      `)
        .bind(user.id)
        .all<{
          id: string;
          content_type: string;
          size_bytes: number;
          is_primary: number;
          created_at: string;
        }>();

      return json({
        success: true,
        photos: (result.results ?? []).map((photo) => ({
          id: photo.id,
          url: `/api/profile/photos/${photo.id}`,
          contentType: photo.content_type,
          sizeBytes: photo.size_bytes,
          isPrimary: photo.is_primary === 1,
          createdAt: photo.created_at,
        })),
      });
    }

    // UPLOAD A PHOTO
    if (request.method === "POST" && !photoId) {
      const contentType = request.headers.get("Content-Type") ?? "";

      if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
        return json({
          success: false,
          error: "Upload must use multipart/form-data.",
        }, 415);
      }

      const form = await request.formData();
      const file = form.get("photo");

      if (!(file instanceof File) || file.size === 0) {
        return json({
          success: false,
          error: "Please select a photo to upload.",
        }, 400);
      }

      if (file.size > MAX_SIZE) {
        return json({
          success: false,
          error: "Each photo must be 5 MB or smaller.",
        }, 413);
      }

      if (!allowedTypes.has(file.type.toLowerCase())) {
        return json({
          success: false,
          error: "Use a JPEG, PNG, or WebP image.",
        }, 415);
      }

      const existing = await env.DB.prepare(`
        SELECT COUNT(*) AS total
        FROM member_photos
        WHERE user_id = ?
      `)
        .bind(user.id)
        .first<{ total: number }>();

      if ((existing?.total ?? 0) >= MAX_PHOTOS) {
        return json({
          success: false,
          error: "You can upload up to 8 profile photos.",
        }, 400);
      }

      const bytes = new Uint8Array(await file.arrayBuffer());

      // Verify the file signature instead of trusting its filename.
      const isJpeg =
        file.type === "image/jpeg" &&
        bytes.length >= 3 &&
        bytes[0] === 0xff &&
        bytes[1] === 0xd8 &&
        bytes[2] === 0xff;

      const isPng =
        file.type === "image/png" &&
        bytes.length >= 8 &&
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a;

      const isWebp =
        file.type === "image/webp" &&
        bytes.length >= 12 &&
        String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
        String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";

      if (!isJpeg && !isPng && !isWebp) {
        return json({
          success: false,
          error: "The selected file is not a valid supported image.",
        }, 400);
      }

      await env.DB.prepare(`
        INSERT OR IGNORE INTO member_profiles (user_id)
        VALUES (?)
      `)
        .bind(user.id)
        .run();

      const photoIdNew = randomId();
      const objectKey = `users/${user.id}/${photoIdNew}`;
      const isPrimary = (existing?.total ?? 0) === 0;

      // Store the image in private R2 storage.
      await env.PHOTOS.put(objectKey, bytes, {
        httpMetadata: {
          contentType: file.type.toLowerCase(),
        },
      });

      try {
        await env.DB.prepare(`
          INSERT INTO member_photos (
            id,
            user_id,
            object_key,
            content_type,
            size_bytes,
            is_primary
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `)
          .bind(
            photoIdNew,
            user.id,
            objectKey,
            file.type.toLowerCase(),
            file.size,
            isPrimary ? 1 : 0,
          )
          .run();

        if (isPrimary) {
          await env.DB.prepare(`
            UPDATE member_profiles
            SET profile_photo_url = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
          `)
            .bind(`/api/profile/photos/${photoIdNew}`, user.id)
            .run();
        }
      } catch (error) {
        // Avoid leaving an untracked object if the database write fails.
        await env.PHOTOS.delete(objectKey);
        throw error;
      }

      return json({
        success: true,
        message: "Photo uploaded successfully.",
        photo: {
          id: photoIdNew,
          url: `/api/profile/photos/${photoIdNew}`,
          contentType: file.type.toLowerCase(),
          sizeBytes: file.size,
          isPrimary,
        },
      }, 201);
    }

    // DELETE A PHOTO OWNED BY THE SIGNED-IN MEMBER
    if (request.method === "DELETE" && photoId) {
      const photo = await env.DB.prepare(`
        SELECT id, object_key, is_primary
        FROM member_photos
        WHERE id = ? AND user_id = ?
        LIMIT 1
      `)
        .bind(photoId, user.id)
        .first<{
          id: string;
          object_key: string;
          is_primary: number;
        }>();

      if (!photo) {
        return json({
          success: false,
          error: "Photo not found.",
        }, 404);
      }

      await env.PHOTOS.delete(photo.object_key);

      await env.DB.prepare(`
        DELETE FROM member_photos
        WHERE id = ? AND user_id = ?
      `)
        .bind(photoId, user.id)
        .run();

      if (photo.is_primary === 1) {
        const nextPhoto = await env.DB.prepare(`
          SELECT id
          FROM member_photos
          WHERE user_id = ?
          ORDER BY created_at DESC
          LIMIT 1
        `)
          .bind(user.id)
          .first<{ id: string }>();

        if (nextPhoto) {
          await env.DB.prepare(`
            UPDATE member_photos
            SET is_primary = CASE WHEN id = ? THEN 1 ELSE 0 END
            WHERE user_id = ?
          `)
            .bind(nextPhoto.id, user.id)
            .run();

          await env.DB.prepare(`
            UPDATE member_profiles
            SET profile_photo_url = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
          `)
            .bind(`/api/profile/photos/${nextPhoto.id}`, user.id)
            .run();
        } else {
          await env.DB.prepare(`
            UPDATE member_profiles
            SET profile_photo_url = '',
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
          `)
            .bind(user.id)
            .run();
        }
      }

      return json({
        success: true,
        message: "Photo deleted successfully.",
      });
    }

    return json({
      success: false,
      error: "Photo endpoint or method not supported.",
    }, 405);
  } catch (error) {
    console.error("Heartora photo management failed:", error);

    return json({
      success: false,
      error: "Unable to manage photos right now. Please try again.",
    }, 500);
  }
          }

// HEARTORA: CREATE OR REOPEN A PRIVATE CONVERSATION
async function handleCreateConversation(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({
      success: false,
      error: "Method not allowed.",
    }, 405);
  }

  if (!isSameOriginRequest(request)) {
    return json({
      success: false,
      error: "Request origin rejected.",
    }, 403);
  }

  const user = await currentUser(request, env);

  if (!user) {
    return json({
      success: false,
      error: "Please sign in to message members.",
    }, 401);
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

  let body: Record<string, unknown>;

  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return json({
      success: false,
      error: "Invalid JSON request.",
    }, 400);
  }

  const memberId =
    typeof body.memberId === "string"
      ? body.memberId.trim()
      : "";

  if (
    !/^[0-9a-f-]{36}$/i.test(memberId) ||
    memberId === user.id
  ) {
    return json({
      success: false,
      error: "Please select a valid member.",
    }, 400);
  }

  try {
    // Verify both accounts and their ages.
    const target = await env.DB.prepare(`
      SELECT
        u.id,
        u.date_of_birth,
        mp.show_in_discovery
      FROM users u
      JOIN member_profiles mp ON mp.user_id = u.id
      WHERE u.id = ?
      LIMIT 1
    `)
      .bind(memberId)
      .first<{
        id: string;
        date_of_birth: string;
        show_in_discovery: number;
      }>();

    const sender = await env.DB.prepare(`
      SELECT date_of_birth
      FROM users
      WHERE id = ?
      LIMIT 1
    `)
      .bind(user.id)
      .first<{ date_of_birth: string }>();

    if (
      !target ||
      !sender ||
      calculateAge(sender.date_of_birth) < 18 ||
      calculateAge(target.date_of_birth) < 18
    ) {
      return json({
        success: false,
        error: "This member is unavailable for messaging.",
      }, 404);
    }

    // Either member blocking the other prevents messaging.
    const block = await env.DB.prepare(`
      SELECT blocker_id
      FROM member_blocks
      WHERE
        (blocker_id = ? AND blocked_id = ?)
        OR
        (blocker_id = ? AND blocked_id = ?)
      LIMIT 1
    `)
      .bind(user.id, memberId, memberId, user.id)
      .first<{ blocker_id: string }>();

    if (block) {
      return json({
        success: false,
        error: "This conversation is unavailable.",
      }, 403);
    }

    // Only discoverable profiles may receive new conversations.
    if (target.show_in_discovery !== 1) {
      return json({
        success: false,
        error: "This member is unavailable for new conversations.",
      }, 404);
    }

    // Reuse an existing conversation shared by both members.
    const existing = await env.DB.prepare(`
      SELECT c.id
      FROM member_conversations c
      JOIN member_conversation_participants p1
        ON p1.conversation_id = c.id
      JOIN member_conversation_participants p2
        ON p2.conversation_id = c.id
      WHERE p1.user_id = ?
        AND p2.user_id = ?
      LIMIT 1
    `)
      .bind(user.id, memberId)
      .first<{ id: string }>();

    if (existing) {
      return json({
        success: true,
        conversation: {
          id: existing.id,
          memberId,
        },
        existing: true,
      });
    }

    // Create the conversation and its two participants.
    const conversationId = randomId();

    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO member_conversations (id)
        VALUES (?)
      `).bind(conversationId),

      env.DB.prepare(`
        INSERT INTO member_conversation_participants
          (conversation_id, user_id)
        VALUES (?, ?)
      `).bind(conversationId, user.id),

      env.DB.prepare(`
        INSERT INTO member_conversation_participants
          (conversation_id, user_id)
        VALUES (?, ?)
      `).bind(conversationId, memberId),
    ]);

    return json({
      success: true,
      conversation: {
        id: conversationId,
        memberId,
      },
      existing: false,
    }, 201);
  } catch (error) {
    console.error("Heartora conversation creation failed:", error);

    return json({
      success: false,
      error: "Unable to start this conversation right now.",
    }, 500);
  }
}
// HEARTORA: READ AND SEND PRIVATE MESSAGES
async function handleConversationMessages(
  request: Request,
  env: Env,
  conversationId: string,
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "POST") {
    return json({
      success: false,
      error: "Method not allowed.",
    }, 405);
  }

  if (request.method === "POST" && !isSameOriginRequest(request)) {
    return json({
      success: false,
      error: "Request origin rejected.",
    }, 403);
  }

  const user = await currentUser(request, env);

  if (!user) {
    return json({
      success: false,
      error: "Please sign in to access messages.",
    }, 401);
  }

  if (
    request.method === "POST" &&
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

  if (!/^[0-9a-f-]{36}$/i.test(conversationId)) {
    return json({
      success: false,
      error: "Invalid conversation.",
    }, 400);
  }

  try {
    // Confirm that the signed-in user is an adult.
    const account = await env.DB.prepare(`
      SELECT date_of_birth
      FROM users
      WHERE id = ?
      LIMIT 1
    `)
      .bind(user.id)
      .first<{ date_of_birth: string }>();

    if (!account || calculateAge(account.date_of_birth) < 18) {
      return json({
        success: false,
        error: "Messaging is available to adults aged 18 and older.",
      }, 403);
    }

    // Only conversation participants may read or send messages.
    const participant = await env.DB.prepare(`
      SELECT user_id
      FROM member_conversation_participants
      WHERE conversation_id = ?
        AND user_id = ?
      LIMIT 1
    `)
      .bind(conversationId, user.id)
      .first<{ user_id: string }>();

    if (!participant) {
      return json({
        success: false,
        error: "Conversation not found.",
      }, 404);
    }

    // Confirm that the other participant has not blocked this user,
    // and that this user has not blocked the other participant.
    const otherParticipant = await env.DB.prepare(`
      SELECT user_id
      FROM member_conversation_participants
      WHERE conversation_id = ?
        AND user_id <> ?
      LIMIT 1
    `)
      .bind(conversationId, user.id)
      .first<{ user_id: string }>();

    if (!otherParticipant) {
      return json({
        success: false,
        error: "Conversation not found.",
      }, 404);
    }

    const block = await env.DB.prepare(`
      SELECT blocker_id
      FROM member_blocks
      WHERE
        (blocker_id = ? AND blocked_id = ?)
        OR
        (blocker_id = ? AND blocked_id = ?)
      LIMIT 1
    `)
      .bind(
        user.id,
        otherParticipant.user_id,
        otherParticipant.user_id,
        user.id,
      )
      .first<{ blocker_id: string }>();

    if (block) {
      return json({
        success: false,
        error: "Messaging is unavailable for this conversation.",
      }, 403);
    }

    // SEND A MESSAGE
    if (request.method === "POST") {
      let body: Record<string, unknown>;

      try {
        body = await request.json() as Record<string, unknown>;
      } catch {
        return json({
          success: false,
          error: "Invalid JSON request.",
        }, 400);
      }

      const messageBody =
        typeof body.body === "string"
          ? body.body.trim()
          : "";

      if (!messageBody) {
        return json({
          success: false,
          error: "Please enter a message.",
        }, 400);
      }

      if (messageBody.length > 2000) {
        return json({
          success: false,
          error: "Messages cannot exceed 2,000 characters.",
        }, 400);
      }

      const messageId = randomId();

      await env.DB.batch([
        env.DB.prepare(`
          INSERT INTO member_messages
            (id, conversation_id, sender_id, body)
          VALUES (?, ?, ?, ?)
        `).bind(
          messageId,
          conversationId,
          user.id,
          messageBody,
        ),

        env.DB.prepare(`
          UPDATE member_conversations
          SET updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(conversationId),
      ]);

      return json({
        success: true,
        message: {
          id: messageId,
          conversationId,
          senderId: user.id,
          body: messageBody,
          createdAt: new Date().toISOString(),
          readAt: null,
        },
      }, 201);
    }

    // READ MESSAGES IN CHRONOLOGICAL ORDER.
    // Mark incoming messages as read only after participant verification.
    await env.DB.prepare(`
      UPDATE member_messages
      SET read_at = CURRENT_TIMESTAMP
      WHERE conversation_id = ?
        AND sender_id <> ?
        AND read_at IS NULL
    `)
      .bind(conversationId, user.id)
      .run();

    const results = await env.DB.prepare(`
      SELECT
        id,
        conversation_id,
        sender_id,
        body,
        created_at,
        read_at
      FROM member_messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC, id ASC
      LIMIT 200
    `)
      .bind(conversationId)
      .all<{
        id: string;
        conversation_id: string;
        sender_id: string;
        body: string;
        created_at: string;
        read_at: string | null;
      }>();

    return json({
      success: true,
      messages: (results.results || []).map((message) => ({
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        body: message.body,
        createdAt: message.created_at,
        readAt: message.read_at,
      })),
    });
  } catch (error) {
    console.error("Heartora message operation failed:", error);

    return json({
      success: false,
      error: "Unable to process messages right now.",
    }, 500);
  }
      }
// HEARTORA: MEMBER MESSAGING INBOX
async function handleMessageInbox(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "GET") {
    return json({
      success: false,
      error: "Method not allowed.",
    }, 405);
  }

  const user = await currentUser(request, env);

  if (!user) {
    return json({
      success: false,
      error: "Please sign in to view your inbox.",
    }, 401);
  }

  try {
    // Only adults may access private messaging.
    const account = await env.DB.prepare(`
      SELECT date_of_birth
      FROM users
      WHERE id = ?
      LIMIT 1
    `)
      .bind(user.id)
      .first<{ date_of_birth: string }>();

    if (!account || calculateAge(account.date_of_birth) < 18) {
      return json({
        success: false,
        error: "Messaging is available to adults aged 18 and older.",
      }, 403);
    }

    const result = await env.DB.prepare(`
      SELECT
        c.id AS conversation_id,
        c.updated_at AS conversation_updated_at,
        other.id AS member_id,
        other.display_name AS member_display_name,
        other.country AS member_country,
        mp.city AS member_city,
        mp.bio AS member_bio,
        mp.profile_photo_url AS member_profile_photo_url,
        (
          SELECT m.id
          FROM member_messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC, m.id DESC
          LIMIT 1
        ) AS last_message_id,
        (
          SELECT m.body
          FROM member_messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC, m.id DESC
          LIMIT 1
        ) AS last_message_body,
        (
          SELECT m.sender_id
          FROM member_messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC, m.id DESC
          LIMIT 1
        ) AS last_message_sender_id,
        (
          SELECT m.created_at
          FROM member_messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC, m.id DESC
          LIMIT 1
        ) AS last_message_created_at,
        (
          SELECT COUNT(*)
          FROM member_messages unread
          WHERE unread.conversation_id = c.id
            AND unread.sender_id <> ?
            AND unread.read_at IS NULL
        ) AS unread_count
      FROM member_conversations c
      JOIN member_conversation_participants mine
        ON mine.conversation_id = c.id
       AND mine.user_id = ?
      JOIN member_conversation_participants theirs
        ON theirs.conversation_id = c.id
       AND theirs.user_id <> ?
      JOIN users other
        ON other.id = theirs.user_id
      JOIN member_profiles mp
        ON mp.user_id = other.id
      WHERE
        NOT EXISTS (
          SELECT 1
          FROM member_blocks b
          WHERE
            (b.blocker_id = ? AND b.blocked_id = other.id)
            OR
            (b.blocker_id = other.id AND b.blocked_id = ?)
        )
        AND CAST(
          (julianday('now') - julianday(other.date_of_birth)) / 365.2425
          AS INTEGER
        ) >= 18
      ORDER BY
        COALESCE(last_message_created_at, c.updated_at) DESC,
        c.id DESC
      LIMIT 100
    `)
      .bind(
        user.id,
        user.id,
        user.id,
        user.id,
        user.id,
      )
      .all<{
        conversation_id: string;
        conversation_updated_at: string;
        member_id: string;
        member_display_name: string;
        member_country: string;
        member_city: string | null;
        member_bio: string | null;
        member_profile_photo_url: string | null;
        last_message_id: string | null;
        last_message_body: string | null;
        last_message_sender_id: string | null;
        last_message_created_at: string | null;
        unread_count: number;
      }>();

    return json({
      success: true,
      conversations: (result.results || []).map((item) => ({
        id: item.conversation_id,
        updatedAt: item.conversation_updated_at,
        member: {
          id: item.member_id,
          displayName: item.member_display_name,
          country: item.member_country,
          city: item.member_city,
          bio: item.member_bio,
          profilePhotoUrl: item.member_profile_photo_url,
        },
        lastMessage: item.last_message_id
          ? {
              id: item.last_message_id,
              body: item.last_message_body,
              senderId: item.last_message_sender_id,
              createdAt: item.last_message_created_at,
            }
          : null,
        unreadCount: Number(item.unread_count || 0),
      })),
    });
  } catch (error) {
    console.error("Heartora inbox load failed:", error);

    return json({
      success: false,
      error: "Unable to load your inbox right now.",
    }, 500);
  }
        }
// HEARTORA: BLOCK A MEMBER
async function handleBlockMember(
  request: Request,
  env: Env,
  memberId: string,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({
      success: false,
      error: "Method not allowed.",
    }, 405);
  }

  if (!isSameOriginRequest(request)) {
    return json({
      success: false,
      error: "Request origin rejected.",
    }, 403);
  }

  const user = await currentUser(request, env);

  if (!user) {
    return json({
      success: false,
      error: "Please sign in to block a member.",
    }, 401);
  }

  if (
    !/^[0-9a-f-]{36}$/i.test(memberId) ||
    memberId === user.id
  ) {
    return json({
      success: false,
      error: "Please select a valid member.",
    }, 400);
  }

  try {
    const account = await env.DB.prepare(`
      SELECT date_of_birth
      FROM users
      WHERE id = ?
      LIMIT 1
    `)
      .bind(user.id)
      .first<{ date_of_birth: string }>();

    if (!account || calculateAge(account.date_of_birth) < 18) {
      return json({
        success: false,
        error: "This feature is available to adults aged 18 and older.",
      }, 403);
    }

    const target = await env.DB.prepare(`
      SELECT id
      FROM users
      WHERE id = ?
      LIMIT 1
    `)
      .bind(memberId)
      .first<{ id: string }>();

    if (!target) {
      return json({
        success: false,
        error: "Member not found.",
      }, 404);
    }

    await env.DB.prepare(`
      INSERT OR IGNORE INTO member_blocks
        (blocker_id, blocked_id)
      VALUES (?, ?)
    `)
      .bind(user.id, memberId)
      .run();

    return json({
      success: true,
      message: "This member has been blocked.",
    });
  } catch (error) {
    console.error("Heartora block member failed:", error);

    return json({
      success: false,
      error: "Unable to block this member right now.",
    }, 500);
  }
}


// HEARTORA: REPORT A MEMBER
async function handleReportMember(
  request: Request,
  env: Env,
  memberId: string,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({
      success: false,
      error: "Method not allowed.",
    }, 405);
  }

  if (!isSameOriginRequest(request)) {
    return json({
      success: false,
      error: "Request origin rejected.",
    }, 403);
  }

  const user = await currentUser(request, env);

  if (!user) {
    return json({
      success: false,
      error: "Please sign in to report a member.",
    }, 401);
  }

  if (
    !/^[0-9a-f-]{36}$/i.test(memberId) ||
    memberId === user.id
  ) {
    return json({
      success: false,
      error: "Please select a valid member.",
    }, 400);
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

  let body: Record<string, unknown>;

  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return json({
      success: false,
      error: "Invalid JSON request.",
    }, 400);
  }

  const allowedReasons = [
    "harassment",
    "fake_profile",
    "scam",
    "inappropriate_content",
    "underage",
    "other",
  ];

  const reason =
    typeof body.reason === "string"
      ? body.reason.trim()
      : "";

  const details =
    typeof body.details === "string"
      ? body.details.trim()
      : "";

  if (!allowedReasons.includes(reason)) {
    return json({
      success: false,
      error: "Please select a valid report reason.",
    }, 400);
  }

  if (details.length > 2000) {
    return json({
      success: false,
      error: "Report details cannot exceed 2,000 characters.",
    }, 400);
  }

  try {
    const account = await env.DB.prepare(`
      SELECT date_of_birth
      FROM users
      WHERE id = ?
      LIMIT 1
    `)
      .bind(user.id)
      .first<{ date_of_birth: string }>();

    if (!account || calculateAge(account.date_of_birth) < 18) {
      return json({
        success: false,
        error: "This feature is available to adults aged 18 and older.",
      }, 403);
    }

    const target = await env.DB.prepare(`
      SELECT id
      FROM users
      WHERE id = ?
      LIMIT 1
    `)
      .bind(memberId)
      .first<{ id: string }>();

    if (!target) {
      return json({
        success: false,
        error: "Member not found.",
      }, 404);
    }

    const reportId = randomId();

    await env.DB.prepare(`
      INSERT INTO member_reports (
        id,
        reporter_id,
        reported_user_id,
        reason,
        details
      )
      VALUES (?, ?, ?, ?, ?)
    `)
      .bind(
        reportId,
        user.id,
        memberId,
        reason,
        details,
      )
      .run();

    return json({
      success: true,
      message: "Your report has been submitted for review.",
      reportId,
    }, 201);
  } catch (error) {
    console.error("Heartora report member failed:", error);

    return json({
      success: false,
      error: "Unable to submit your report right now.",
    }, 500);
  }
      }
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    // HEARTORA: PRIVATE MESSAGING ROUTES
if (url.pathname === "/api/messages/conversations") {
  return handleCreateConversation(request, env);
}
    // HEARTORA: MEMBER INBOX ROUTE
if (url.pathname === "/api/messages/inbox") {
  return handleMessageInbox(request, env);
}
    // HEARTORA: MEMBER NOTIFICATIONS ROUTES

if (url.pathname === "/api/notifications") {
  return handleMemberNotifications(request, env);
}

if (url.pathname === "/api/notifications/read") {
  return handleMarkNotificationRead(request, env);
}

if (url.pathname === "/api/notifications/read-all") {
  return handleMarkAllNotificationsRead(request, env);
}
    // HEARTORA: BLOCK MEMBER ROUTE
const blockMemberMatch = url.pathname.match(
  /^\/api\/members\/([0-9a-f-]{36})\/block$/i,
);

if (blockMemberMatch) {
  return handleBlockMember(
    request,
    env,
    blockMemberMatch[1],
  );
}

// HEARTORA: REPORT MEMBER ROUTE
const reportMemberMatch = url.pathname.match(
  /^\/api\/members\/([0-9a-f-]{36})\/report$/i,
);

if (reportMemberMatch) {
  return handleReportMember(
    request,
    env,
    reportMemberMatch[1],
  );
}
    // HEARTORA: READ OR SEND MESSAGES IN A CONVERSATION
const conversationMessagesMatch = url.pathname.match(
  /^\/api\/messages\/conversations\/([0-9a-f-]{36})\/messages$/i,
);

if (conversationMessagesMatch) {
  return handleConversationMessages(
    request,
    env,
    conversationMessagesMatch[1],
  );
}
    // HEARTORA MEMBER PHOTO MANAGEMENT
if (url.pathname === "/api/profile/photos") {
  if (request.method !== "GET" && request.method !== "POST") {
    return json({
      success: false,
      error: "Method not allowed.",
    }, 405);
  }

  return handleProfilePhotos(request, env);
}

const photoMatch = url.pathname.match(
  /^\/api\/profile\/photos\/([0-9a-f-]{36})$/i,
);

if (photoMatch) {
  if (
    request.method !== "GET" &&
    request.method !== "DELETE"
  ) {
    return json({
      success: false,
      error: "Method not allowed.",
    }, 405);
  }

  return handleProfilePhotos(request, env, photoMatch[1]);
}
        // HEARTORA MEMBER DISCOVERY
    if (url.pathname === "/api/discovery/members") {
      if (request.method !== "GET") {
        return json({
          success: false,
          error: "Method not allowed.",
        }, 405);
      }

      try {
        const user = await currentUser(request, env);

        if (!user) {
          return json({
            success: false,
            error: "Please sign in to discover members.",
          }, 401);
        }

        const country = (
          url.searchParams.get("country") ?? ""
        ).trim();

        const pageValue = Number(
          url.searchParams.get("page") ?? "1"
        );

        const page =
          Number.isSafeInteger(pageValue) && pageValue > 0
            ? Math.min(pageValue, 1000000)
            : 1;

        const limit = 24;
        const offset = (page - 1) * limit;

        let where = `
          WHERE mp.show_in_discovery = 1
          AND u.id <> ?
        `;

        const params: (string | number)[] = [user.id];

        if (country && country.toLowerCase() !== "worldwide") {
          where += " AND LOWER(u.country) = LOWER(?)";
          params.push(country);
        }

        const count = await env.DB.prepare(`
          SELECT COUNT(*) AS total
          FROM users u
          JOIN member_profiles mp ON mp.user_id = u.id
          ${where}
        `)
          .bind(...params)
          .first<{ total: number }>();

        const result = await env.DB.prepare(`
          SELECT
            u.id,
            u.display_name,
            u.country,
            mp.bio,
            mp.city,
            mp.profile_photo_url,
            mp.interests
          FROM users u
          JOIN member_profiles mp ON mp.user_id = u.id
          ${where}
          ORDER BY mp.updated_at DESC
          LIMIT ? OFFSET ?
        `)
          .bind(...params, limit, offset)
          .all<{
            id: string;
            display_name: string;
            country: string;
            bio: string;
            city: string;
            profile_photo_url: string;
            interests: string;
          }>();

        return json({
          success: true,
          members: (result.results ?? []).map((member) => ({
            id: member.id,
            displayName: member.display_name,
            country: member.country,
            bio: member.bio,
            city: member.city,
            profilePhotoUrl: member.profile_photo_url,
            interests: member.interests,
          })),
          pagination: {
            page,
            limit,
            total: count?.total ?? 0,
            totalPages: Math.ceil((count?.total ?? 0) / limit),
          },
        });
      } catch (error) {
        console.error("Member discovery request failed:", error);

        return json({
          success: false,
          error: "Unable to load members right now.",
        }, 500);
      }
      }
    // HEARTORA: VIEW ANOTHER MEMBER'S PROFILE
const publicMemberMatch = url.pathname.match(
  /^\/api\/members\/([0-9a-f-]{36})$/i,
);

if (publicMemberMatch) {
  if (request.method !== "GET") {
    return json({
      success: false,
      error: "Method not allowed.",
    }, 405);
  }

  try {
    const viewer = await currentUser(request, env);

    if (!viewer) {
      return json({
        success: false,
        error: "Please sign in to view member profiles.",
      }, 401);
    }

    const memberId = publicMemberMatch[1];

    const member = await env.DB.prepare(`
      SELECT
        u.id,
        u.display_name,
        u.date_of_birth,
        u.country,
        mp.bio,
        mp.city,
        mp.interests,
        mp.show_in_discovery
      FROM users u
      JOIN member_profiles mp ON mp.user_id = u.id
      WHERE u.id = ?
      LIMIT 1
    `)
      .bind(memberId)
      .first<{
        id: string;
        display_name: string;
        date_of_birth: string;
        country: string;
        bio: string;
        city: string;
        interests: string;
        show_in_discovery: number;
      }>();

    if (!member) {
      return json({
        success: false,
        error: "Member profile not found.",
      }, 404);
    }

    // Only the profile owner or an authorized discovery viewer
    // may access this profile.
    if (
      member.id !== viewer.id &&
      member.show_in_discovery !== 1
    ) {
      return json({
        success: false,
        error: "This member's profile is not available.",
      }, 404);
    }

    // Heartora is exclusively for adults aged 18 and over.
    const age = calculateAge(member.date_of_birth);

    if (age < 18) {
      return json({
        success: false,
        error: "This member profile is unavailable.",
      }, 404);
    }

    const photoResult = await env.DB.prepare(`
      SELECT id, content_type, is_primary
      FROM member_photos
      WHERE user_id = ?
      ORDER BY is_primary DESC, created_at DESC
    `)
      .bind(member.id)
      .all<{
        id: string;
        content_type: string;
        is_primary: number;
      }>();

    return json({
      success: true,
      profile: {
        id: member.id,
        displayName: member.display_name,
        age,
        country: member.country,
        city: member.city ?? "",
        bio: member.bio ?? "",
        interests: member.interests ?? "",
        photos: (photoResult.results ?? []).map((photo) => ({
          id: photo.id,
          url: `/api/profile/photos/${photo.id}`,
          contentType: photo.content_type,
          isPrimary: photo.is_primary === 1,
        })),
      },
    });
  } catch (error) {
    console.error("Public member profile request failed:", error);

    return json({
      success: false,
      error: "Unable to load this member's profile.",
    }, 500);
  }
      }
    // HEARTORA: GET AND UPDATE MEMBER PROFILE
    if (url.pathname === "/api/profile/me") {
      if (request.method !== "GET" && request.method !== "POST") {
        return json({
          success: false,
          error: "Method not allowed.",
        }, 405);
      }

      if (
        request.method === "POST" &&
        !isSameOriginRequest(request)
      ) {
        return json({
          success: false,
          error: "Request origin rejected.",
        }, 403);
      }

      try {
        const user = await currentUser(request, env);

        if (!user) {
          return json({
            success: false,
            error: "Please sign in to access your profile.",
          }, 401);
        }

        // Load the member's current profile.
        if (request.method === "GET") {
          await env.DB.prepare(
            `INSERT OR IGNORE INTO member_profiles (user_id)
             VALUES (?)`,
          )
            .bind(user.id)
            .run();

          const profile = await env.DB.prepare(
            `SELECT
               u.id,
               u.display_name,
               u.country,
               mp.bio,
               mp.city,
               mp.profile_photo_url,
               mp.interests,
               mp.show_in_discovery,
               mp.updated_at
             FROM users u
             JOIN member_profiles mp ON mp.user_id = u.id
             WHERE u.id = ?
             LIMIT 1`,
          )
            .bind(user.id)
            .first<{
              id: string;
              display_name: string;
              country: string;
              bio: string;
              city: string;
              profile_photo_url: string;
              interests: string;
              show_in_discovery: number;
              updated_at: string;
            }>();

          if (!profile) {
            return json({
              success: false,
              error: "Profile not found.",
            }, 404);
          }

          return json({
            success: true,
            profile: {
              id: profile.id,
              displayName: profile.display_name,
              country: profile.country,
              bio: profile.bio,
              city: profile.city,
              profilePhotoUrl: profile.profile_photo_url,
              interests: profile.interests,
              showInDiscovery: profile.show_in_discovery === 1,
              updatedAt: profile.updated_at,
            },
          });
        }

        // Require JSON for profile updates.
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

        let body: Record<string, unknown>;

        try {
          body = await request.json() as Record<string, unknown>;
        } catch {
          return json({
            success: false,
            error: "Invalid JSON request.",
          }, 400);
        }

        const bio = typeof body.bio === "string"
          ? body.bio.trim()
          : "";

        const city = typeof body.city === "string"
          ? body.city.trim()
          : "";

        const interests = typeof body.interests === "string"
          ? body.interests.trim()
          : "";

        const showInDiscovery = body.showInDiscovery;

        if (
          bio.length > 1000 ||
          city.length > 100 ||
          interests.length > 500 ||
          typeof showInDiscovery !== "boolean"
        ) {
          return json({
            success: false,
            error: "Please check your profile details and try again.",
          }, 400);
        }

        await env.DB.prepare(
          `INSERT OR IGNORE INTO member_profiles (user_id)
           VALUES (?)`,
        )
          .bind(user.id)
          .run();

        await env.DB.prepare(
          `UPDATE member_profiles
           SET bio = ?,
               city = ?,
               interests = ?,
               show_in_discovery = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ?`,
        )
          .bind(
            bio,
            city,
            interests,
            showInDiscovery ? 1 : 0,
            user.id,
          )
          .run();

        const updated = await env.DB.prepare(
          `SELECT
             u.id,
             u.display_name,
             u.country,
             mp.bio,
             mp.city,
             mp.profile_photo_url,
             mp.interests,
             mp.show_in_discovery,
             mp.updated_at
           FROM users u
           JOIN member_profiles mp ON mp.user_id = u.id
           WHERE u.id = ?
           LIMIT 1`,
        )
          .bind(user.id)
          .first<{
            id: string;
            display_name: string;
            country: string;
            bio: string;
            city: string;
            profile_photo_url: string;
            interests: string;
            show_in_discovery: number;
            updated_at: string;
          }>();

        return json({
          success: true,
          message: "Your profile has been updated.",
          profile: updated
            ? {
                id: updated.id,
                displayName: updated.display_name,
                country: updated.country,
                bio: updated.bio,
                city: updated.city,
                profilePhotoUrl: updated.profile_photo_url,
                interests: updated.interests,
                showInDiscovery:
                  updated.show_in_discovery === 1,
                updatedAt: updated.updated_at,
              }
            : null,
        });
      } catch (error) {
        console.error("Heartora profile request failed:", error);

        return json({
          success: false,
          error: "Unable to load or update your profile.",
        }, 500);
      }
          }
    
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
if (url.pathname === "/api/admin/stats") {
  if (request.method !== "GET") {
    return json({
      success: false,
      error: "Method not allowed.",
    }, 405);
  }

  try {
    const admin = await requireAdmin(request, env);

    if (!admin) {
      return json({
        success: false,
        error: "Administrator access required.",
      }, 403);
    }

    const members = await env.DB.prepare(
      "SELECT COUNT(*) AS total FROM users",
    ).first<{ total: number }>();

    const verified = await env.DB.prepare(
      "SELECT COUNT(*) AS total FROM users WHERE email_verified = 1",
    ).first<{ total: number }>();

    const premium = await env.DB.prepare(
      "SELECT COUNT(*) AS total FROM user_subscriptions",
    ).first<{ total: number }>();

    const active = await env.DB.prepare(
      `SELECT COUNT(*) AS total
       FROM user_subscriptions
       WHERE status = 'active'`,
    ).first<{ total: number }>();
    
const newMembers = await env.DB.prepare(
  `SELECT COUNT(*) AS total
   FROM users
   WHERE created_at >= datetime('now', '-30 days')`,
).first<{ total: number }>();
    
    return json({
  success: true,
  stats: {
    totalMembers: members?.total ?? 0,
    newMembers: newMembers?.total ?? 0,
    verifiedMembers: verified?.total ?? 0,
    premiumSubscribers: premium?.total ?? 0,
    activeSubscriptions: active?.total ?? 0,
  },
});
     
  } catch (error) {
    console.error("Admin statistics request failed:", error);

    return json({
      success: false,
      error: "Unable to load administrator statistics.",
    }, 500);
  }
 }
    if (url.pathname === "/api/admin/members") {
  if (request.method !== "GET") {
    return json({
      success: false,
      error: "Method not allowed.",
    }, 405);
  }

  try {
    const admin = await requireAdmin(request, env);

    if (!admin) {
      return json({
        success: false,
        error: "Administrator access required.",
      }, 403);
    }

    const search = (url.searchParams.get("q") ?? "").trim();
    const pageValue = Number(url.searchParams.get("page") ?? "1");

    const page = Number.isSafeInteger(pageValue) && pageValue > 0
      ? Math.min(pageValue, 1000000)
      : 1;

    const limit = 50;
    const offset = (page - 1) * limit;

    let query = `
      SELECT
        id,
        email,
        display_name,
        country,
        email_verified,
        created_at
      FROM users
    `;

    let countQuery = "SELECT COUNT(*) AS total FROM users";

    const params: string[] = [];

    if (search) {
      query += " WHERE email LIKE ? OR display_name LIKE ?";
      countQuery += " WHERE email LIKE ? OR display_name LIKE ?";

      const term = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
      params.push(term, term);
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";

    const memberRows = await env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all<{
        id: string;
        email: string;
        display_name: string;
        country: string;
        email_verified: number;
        created_at: string;
      }>();

    const countResult = await env.DB.prepare(countQuery)
      .bind(...params)
      .first<{ total: number }>();

    return json({
      success: true,
      members: (memberRows.results ?? []).map((member) => ({
        id: member.id,
        email: member.email,
        displayName: member.display_name,
        country: member.country,
        emailVerified: member.email_verified === 1,
        createdAt: member.created_at,
      })),
      pagination: {
        page,
        limit,
        total: countResult?.total ?? 0,
      },
    });
  } catch (error) {
    console.error("Admin member directory request failed:", error);

    return json({
      success: false,
      error: "Unable to load the member directory.",
    }, 500);
  }
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
    if (url.pathname === "/api/stripe/webhook") {
  return handleStripeWebhook(request, env);
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
