// Northstar Method webhook receiver — Standard Webhooks implementation
// Timestamp: 5-min window enforced by standardwebhooks library
// Idempotency: keyed on webhook-id header; concurrent-safe via checkAndMark
// Server pixel: reuses browser event_id from checkout metadata (event_name=lead)

import { Webhook, WebhookVerificationError } from "standardwebhooks";
import { createIdempotencyStore } from "#/lib/idempotency/index";
import type { IdempotencyStore } from "#/lib/idempotency/types";
import type { KVNamespace } from "#/lib/idempotency/cloudflare-kv";

export interface WhopWebhookEnv {
  WHOP_WEBHOOK_SECRET?: string;
  IDEMPOTENCY_KV?: KVNamespace;
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

function makeAuthHeader(apiKey: string): string {
  return ["Bearer", apiKey].join(" ");
}

async function fireServerPixelEvent(
  eventName: string,
  eventId: string,
  userData: Record<string, unknown>,
  env: WhopWebhookEnv,
): Promise<void> {
  const apiKey = env.WHOP_API_KEY;
  const apiOrigin = env.WHOP_API_ORIGIN ?? "https://api.whop.com";
  const companyId = env.WHOP_COMPANY_ID;
  if (!apiKey || !companyId) return;

  const payload = { account_id: companyId, event_name: eventName, event_id: eventId, event_time: Math.floor(Date.now() / 1000), user_data: userData };
  const resp = await fetch(`${apiOrigin}/api/v1/server_events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: makeAuthHeader(apiKey) },
    body: JSON.stringify(payload),
  }).catch(() => null);
  if (resp && !resp.ok) console.error(`[NS] Server pixel ${resp.status}`);
}

async function handlePaymentSucceeded(event: WebhookEvent, env: WhopWebhookEnv): Promise<void> {
  const metadata = (event.data["metadata"] ?? {}) as Record<string, unknown>;
  const browserEventId = typeof metadata["event_id"] === "string" ? metadata["event_id"] : null;
  if (!browserEventId) return;
  const customer = (event.data["customer"] ?? event.data["user"] ?? {}) as Record<string, unknown>;
  const userData: Record<string, unknown> = {};
  if (typeof customer["email"] === "string") userData["email"] = customer["email"];
  if (typeof customer["id"] === "string") userData["user_id"] = customer["id"];
  await fireServerPixelEvent("lead", browserEventId, userData, env);
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

export async function dispatchWebhookEvent(event: WebhookEvent, env: WhopWebhookEnv): Promise<void> {
  const key = `${event.type}.${event.action}`;
  if (key === "payment.succeeded") await handlePaymentSucceeded(event, env);
  else if (key === "membership.activated") await handleMembershipActivated(event);
  else if (key === "membership.deactivated") await handleMembershipDeactivated(event);
  else if (key === "refund.created") await handleRefundCreated(event);
  else console.info("[NS] Ignoring event:", key);
}

export async function handleWebhookRequest(
  request: Request,
  env: WhopWebhookEnv,
  store?: IdempotencyStore,
): Promise<Response> {
  const idem = store ?? createIdempotencyStore(env.IDEMPOTENCY_KV);

  let rawBody: string;
  try { rawBody = await request.text(); }
  catch { return new Response("Bad request body", { status: 400 }); }

  const wid = request.headers.get("webhook-id") ?? "";
  const wts = request.headers.get("webhook-timestamp") ?? "";
  const wsig = request.headers.get("webhook-signature") ?? "";
  if (!wid || !wts || !wsig) return new Response("Missing Standard Webhooks headers", { status: 400 });

  const isNew = await idem.checkAndMark(wid);
  if (!isNew) return new Response("Already processed", { status: 200 });

  const wsecret = env.WHOP_WEBHOOK_SECRET;
  if (!wsecret) return new Response("Webhook secret not configured", { status: 500 });

  let event: WebhookEvent;
  try {
    event = verifyWebhookSignature(wsecret, rawBody, { "webhook-id": wid, "webhook-timestamp": wts, "webhook-signature": wsig });
  } catch (err) {
    if (err instanceof WebhookVerificationError) return new Response(`Verification failed: ${err.message}`, { status: 401 });
    return new Response("Internal error", { status: 500 });
  }

  const eventKey = `${event.type}.${event.action}`;
  if (!SUPPORTED_EVENTS.has(eventKey)) return new Response("Event type not handled", { status: 200 });

  try { await dispatchWebhookEvent(event, env); }
  catch { return new Response("Dispatch error", { status: 500 }); }

  return new Response("OK", { status: 200 });
}
