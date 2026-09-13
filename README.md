# Northstar Method — Whop Storefront

Fitness coaching storefront built on Whop, implementing the FDE assessment requirements.

**Business:** `biz_MIbRyC2ejVkuzs`  
**App:** `app_hNmLREmR4ScgWh`  
**Build (initial):** `apbu_X9Js1D7Sr67kO`  
**Live URL:** `https://kernelpanic.whop.site`

---

## Stack

- **Framework:** TanStack Start (React + TanStack Router, SSR)
- **Hosting:** Cloudflare Workers via `@cloudflare/vite-plugin`
- **Checkout:** Whop Elements embedded checkout + checkout-link CTAs
- **Pixel:** Whop pixel (`https://t.whop.tw/e/{biz_id}.js`) for browser-side tracking
- **Webhooks:** Standard Webhooks signature verification (`standardwebhooks` library)
- **Idempotency:** In-memory adapter (dev/test) + Cloudflare KV contract (prod)

---

## Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env and fill in values
cp .env.example .env

# 3. Start dev server
pnpm dev        # → http://localhost:3000
```

---

## Environment Variables

See `.env.example` for the full list.  
**Never commit `.env` or real secrets.**

| Variable | Required | Description |
|---|---|---|
| `WHOP_API_KEY` | Yes | From whop.com/dashboard → Settings → API |
| `WHOP_COMPANY_ID` | Yes | `biz_MIbRyC2ejVkuzs` |
| `WHOP_WEBHOOK_SECRET` | Yes | From webhook registration (format: `whsec_...`) |
| `WHOP_PLAN_12WK` | Yes | Plan ID for the 12-Week Program |
| `WHOP_PLAN_MONTHLY` | Yes | Plan ID for Monthly membership |
| `WHOP_PLAN_YEARLY` | Yes | Plan ID for Annual membership |
| `WHOP_API_ORIGIN` | No | Override API base (default: https://api.whop.com) |

---

## Product & Plan Setup (Dashboard Steps)

1. Go to **whop.com/dashboard/biz_MIbRyC2ejVkuzs/products/**
2. Create one product: **Northstar 12-Week Program**
3. Add three plans:
   - **$297 one-time** (strike-through $397) → copy ID as `WHOP_PLAN_12WK`
   - **$49/month** with 7-day trial → copy ID as `WHOP_PLAN_MONTHLY`
   - **$399/year** → copy ID as `WHOP_PLAN_YEARLY`
4. Add a **Founding Member** plan (hidden from store page)
5. Add a **Waitlist** plan for the live cohort
6. Add **two checkout questions** in each plan's settings
7. Set the **redirect URL** after checkout to: `https://kernelpanic.whop.site/order-complete`

---

## Webhook Registration

1. Go to **Settings → Webhooks → Add Webhook**
2. URL: `https://kernelpanic.whop.site/api/webhooks`
3. Events to subscribe:
   - `payment.succeeded`
   - `membership.activated`
   - `membership.deactivated`
   - `refund.created`
4. Copy the signing secret → set as `WHOP_WEBHOOK_SECRET`

---

## Webhook Idempotency (Production)

The in-memory idempotency store is **dev/test only**. For production:

```bash
# Create a Cloudflare KV namespace
wrangler kv:namespace create IDEMPOTENCY_KV

# Add the returned namespace ID to wrangler.jsonc:
# "kv_namespaces": [{ "binding": "IDEMPOTENCY_KV", "id": "<id>" }]
```

Without this, `createIdempotencyStore` throws at startup in production.

---

## Pixel Tracking & Event-ID Propagation

### Browser → Server Deduplication

1. User visits page → `view_content` fires (fresh event_id)
2. User clicks plan CTA → `add_to_cart` fires (fresh event_id stored in `sessionStorage`)
3. Checkout session is created with `metadata.event_id` = that event_id
4. User submits checkout → Whop fires `payment.succeeded` webhook
5. Webhook handler reads `event.data.metadata.event_id` and fires a server pixel
   event with `event_name="lead"` and the **same event_id**
6. Meta/Whop deduplicates the browser + server signals

### External Advertorial Page

`public/advertorial.html` is a static page that:
- Loads the Whop pixel: `https://t.whop.tw/e/biz_MIbRyC2ejVkuzs.js`
- Calls `window.whop.setScope("biz_MIbRyC2ejVkuzs")` on load
- Fires `view_content`, `lead`, and `add_to_cart` with unique event_ids
- Links to `https://kernelpanic.whop.site/#pricing`

### Verify in Dashboard

**Northstar Dashboard → Analytics → Pixel Events** should show events from both the Whop-hosted site and the external advertorial page.

---

## Deployment

```bash
pnpm deploy    # runs: whop apps deploy
```

This builds and uploads to Cloudflare Workers via the Whop CLI.

### Roll Back

```bash
whop apps builds list
whop apps builds promote --build <previous-build-id>
```

---

## Testing

```bash
pnpm test              # run once
pnpm test:watch        # watch mode
pnpm test:coverage     # with coverage report (target: 80%+)
```

Tests cover:
- Signature verification (valid, tampered, missing headers)
- Timestamp boundaries (5-minute tolerance, stale, future)
- Sequential and concurrent idempotency
- Event dispatch (payment.succeeded server pixel, no-event-id skip)
- Tracking utilities (UUID uniqueness, sessionStorage persistence)
- Idempotency store (mark, has, checkAndMark, concurrent, TTL eviction)

---

## Remaining Manual / Dashboard Steps

- [ ] Connect Meta Pixel ID: **Settings → Integrations → Meta Pixel**
- [ ] Create promo code: **Marketing → Promo Codes**
- [ ] Set up affiliate program: **Marketing → Affiliates** (global and member rates)
- [ ] Configure post-purchase upsell to Annual plan
- [ ] Enable automated abandoned-checkout message
- [ ] Build Ads campaign (stop at review screen)
- [ ] Invite advertiser role team member
- [ ] Register the webhook endpoint (see above)
- [ ] Verify identity to unlock payouts: **Settings → Verification**
- [ ] Buy a test $1 plan to confirm checkout + webhook flow
- [ ] Partially refund the test payment via API and confirm `refund.created` arrives
