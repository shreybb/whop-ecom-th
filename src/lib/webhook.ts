// Northstar Method webhook receiver
// C1 fix: verify signature BEFORE claiming idempotency ID
// H1 fix: server pixel uses event_name=add_to_cart, endpoint POST /api/v1/events

import { Webhook, WebhookVerificationError } from "standardwebhooks";
import { createIdempotencyStore } from "#/lib/idempotency/index";
import type { IdempotencyStore } from "#/lib/idempotency/types";
import type { UpstashEnv } from "#/lib/idempotency/index";

export interface WhopWebhookEnv extends UpstashEnv {
  WHOP_WEBHOOK_SECRET?: string;
  WHOP_API_KEY?: string;
  WHOP_API_ORIGIN?: string;
  WHOP_COMPANY_ID?: string;
}

export interface WebhookEvent {
  type: string;
  action: string;
  data: Record<string, unknown>;
}

const SUPPORTED_EVENTS = new Set([
  "payment.succeeded",
  "membership.activated",
  "membership.deactivated",
  "refund.created",
]);

export function verifyWebhookSignature(
  secret: string,
  rawBody: string,
  headers: Record<string, string>,
): WebhookEvent {
  const wh = new Webhook(secret);
  const parsed = wh.verify(rawBody, headers);
  return parsed as WebhookEvent;
}

function bearerAuth(key: string): string {
  return "Bearer " + key;
}

// Server pixel — endpoint confirmed via `whop events create --schema` 2026-09-12
// Required: account_id, event_name. event_id enables (name,id) deduplication.
// action_source=system_generated marks this as a server-side conversion.
async function fireServerPixelEvent(
  eventName: string,
  eventId: string,
  userData: Record<string, unknown>,
  env: WhopWebhookEnv,
): Promise<void> {
  const apiKey = env.WHOP_API_KEY;
  const apiOrigin = env.WHOP_API_ORIGIN ?? "https://api.whop.com";
  const companyId = env.WHOP_COMPANY_ID;
  if (!apiKey || !companyId) {
    console.warn("[NS] Skipping server pixel: WHOP_API_KEY or WHOP_COMPANY_ID missing.");
    return;
  }
  const payload: Record<string, unknown> = {
    account_id: companyId,
    event_name: eventName,
    event_id: eventId,
    action_source: "system_generated",
    event_time: new Date().toISOString(),
  };
  if (Object.keys(userData).length > 0) payload["user"] = userData;

  const resp = await fetch(apiOrigin + "/api/v1/events", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearerAuth(apiKey) },
    body: JSON.stringify(payload),
  }).catch(() => null);
  if (resp && !resp.ok) console.error("[NS] Server pixel returned " + resp.status);
}

async function handlePaymentSucceeded(event: WebhookEvent, env: WhopWebhookEnv): Promise<void> {
  const metadata = (event.data["metadata"] ?? {}) as Record<string, unknown>;
  const browserEventId =
    typeof metadata["event_id"] === "string" ? metadata["event_id"] : null;
  if (!browserEventId) {
    console.info("[NS] payment.succeeded: no browser event_id in metadata; skipping server pixel.");
    return;
  }
  const customer = (event.data["customer"] ?? event.data["user"] ?? {}) as Record<string, unknown>;
  const userData: Record<string, unknown> = {};
  if (typeof customer["email"] === "string") userData["email"] = customer["email"];
  if (typeof customer["id"] === "string") userData["user_id"] = customer["id"];
  // Use add_to_cart so (event_name, event_id) matches the browser event and deduplicates.
  await fireServerPixelEvent("add_to_cart", browserEventId, userData, env);
}

async function handleMembershipActivated(event: WebhookEvent): Promise<void> {
  console.info("[NS] membership.activated:", event.data["id"]);
}

async function handleMembershipDeactivated(event: WebhookEvent): Promise<void> {
  console.info("[NS] membership.deactivated:", event.data["id"]);
}

async function handleRefundCreated(event: WebhookEvent): Promise<void> {
  console.info("[NS] refund.created:", event.data["id"], "amount:", event.data["amount"]);
}

export async function dispatchWebhookEvent(
  event: WebhookEvent,
  env: WhopWebhookEnv,
): Promise<void> {
  const key = event.type + "." + event.action;
  if (key === "payment.succeeded") await handlePaymentSucceeded(event, env);
  else if (key === "membership.activated") await handleMembershipActivated(event);
  else if (key === "membership.deactivated") await handleMembershipDeactivated(event);
  else if (key === "refund.created") await handleRefundCreated(event);
  else console.info("[NS] Ignoring unsupported event:", key);
}

// C1 FIX: correct ordering
//   1. Read raw body
//   2. Validate headers present
//   3. Check secret configured
//   4. Verify signature + timestamp (throws on failure — ID not consumed)
//   5. Claim the verified ID via checkAndMark
//   6. Dispatch
export async function handleWebhookRequest(
  request: Request,
  env: WhopWebhookEnv,
  store?: IdempotencyStore,
): Promise<Response> {
  let rawBody: string;
  try { rawBody = await request.text(); }
  catch { return new Response("Bad request body", { status: 400 }); }

  const wid = request.headers.get("webhook-id") ?? "";
  const wts = request.headers.get("webhook-timestamp") ?? "";
  const wsig = request.headers.get("webhook-signature") ?? "";
  if (!wid || !wts || !wsig) return new Response("Missing Standard Webhooks headers", { status: 400 });

  const wsecret = env.WHOP_WEBHOOK_SECRET;
  if (!wsecret) return new Response("Webhook secret not configured", { status: 500 });

  let event: WebhookEvent;
  try {
    event = verifyWebhookSignature(wsecret, rawBody, {
      "webhook-id": wid,
      "webhook-timestamp": wts,
      "webhook-signature": wsig,
    });
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      console.warn("[NS] Webhook verification failed:", err.message);
      return new Response("Verification failed: " + err.message, { status: 401 });
    }
    return new Response("Internal error", { status: 500 });
  }

  // Claim ID only after successful verification.
  const idem = store ?? createIdempotencyStore(env);
  const isNew = await idem.checkAndMark(wid);
  if (!isNew) return new Response("Already processed", { status: 200 });

  const eventKey = event.type + "." + event.action;
  if (!SUPPORTED_EVENTS.has(eventKey)) return new Response("Event type not handled", { status: 200 });

  try { await dispatchWebhookEvent(event, env); }
  catch { return new Response("Dispatch error", { status: 500 }); }

  return new Response("OK", { status: 200 });
}
