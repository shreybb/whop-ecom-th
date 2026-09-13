/**
 * Whop pixel tracking utilities for Northstar Method.
 *
 * The Whop pixel is available via `window.whop` on whop.site pages and on any
 * external page that loads `https://t.whop.tw/e/{biz_id}.js`.
 *
 * Every user-initiated event gets a fresh UUID as event_id. The checkout
 * event_id is also persisted in sessionStorage so the server-side webhook
 * handler can receive and reuse it (see src/lib/webhook.ts → handlePaymentSucceeded).
 *
 * Event-ID lifecycle (browser → server deduplication):
 * 1. Browser fires add_to_cart with event_id → stored in sessionStorage.
 * 2. createCheckoutSession passes event_id as checkout metadata.
 * 3. payment.succeeded webhook arrives carrying metadata.event_id.
 * 4. Server fires pixel event with the same event_id → Meta/Whop collapses duplicates.
 */

export const SESSION_CHECKOUT_EVENT_ID_KEY = "ns_checkout_event_id";

/** Generate a cryptographically-random UUID for each user action. */
export function generateEventId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older runtimes
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type WhopWindow = Window & typeof globalThis & {
  whop?: {
    track: (event: string, data?: Record<string, unknown>) => void;
    setScope?: (bizId: string) => void;
  };
};

function getWhop(): (WhopWindow["whop"]) | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as WhopWindow).whop;
}

export function trackViewContent(data?: Record<string, unknown>): string {
  const event_id = generateEventId();
  getWhop()?.track("view_content", { event_id, ...data });
  return event_id;
}

export function trackLead(
  email: string,
  extraData?: Record<string, unknown>,
): string {
  const event_id = generateEventId();
  getWhop()?.track("lead", { event_id, email, ...extraData });
  return event_id;
}

export function trackAddToCart(
  planId: string,
  extraData?: Record<string, unknown>,
): string {
  const event_id = generateEventId();
  // Persist so the server-side webhook can reuse it.
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(SESSION_CHECKOUT_EVENT_ID_KEY, event_id);
  }
  getWhop()?.track("add_to_cart", { event_id, plan_id: planId, ...extraData });
  return event_id;
}

/** Retrieve the persisted checkout event_id (call inside checkout components). */
export function getCheckoutEventId(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(SESSION_CHECKOUT_EVENT_ID_KEY);
}
