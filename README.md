# Northstar Method — Whop Storefront

Fitness coaching storefront built on Whop, implementing the FDE assessment requirements.

**Business:** `biz_MIbRyC2ejVkuzs`  
**App:** `app_wJzJqgIuWNnbPd`  
**Live URL:** `https://northstar-method-fde.whop.site`

---

## Stack

- **Framework:** TanStack Start (React + TanStack Router, SSR)
- **Hosting:** Cloudflare Workers via `@cloudflare/vite-plugin`
- **Checkout:** Whop Elements embedded checkout + checkout-link CTAs
- **Pixel:** Whop pixel (`https://t.whop.tw/e/{biz_id}.js`) for browser-side tracking
- **Webhooks:** Standard Webhooks signature verification (`standardwebhooks` library)
- **Idempotency:** In-memory adapter (dev/test) + Supabase/Postgres unique insert (prod)

---

## Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env and fill in secrets (plan IDs are already defaulted)
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
| `WHOP_COMPANY_ID` | Yes | `biz_MIbRyC2ejVkuzs` (defaulted in `.env.example`) |
| `WHOP_WEBHOOK_SECRET` | Yes | From webhook registration (`ws_...`) |
| `SUPABASE_URL` | Yes (prod) | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (prod) | Supabase service-role key (server only) |
| `WHOP_API_ORIGIN` | No | Override API base (default: https://api.whop.com) |

Plan IDs (`WHOP_PLAN_*`) are public identifiers and are **already hardcoded** in
`src/lib/resources.ts` as canonical defaults. You do not need to set them in `.env`
unless you want to override them.

---

## Resource Identifiers

All public Northstar Whop resource IDs live in `src/lib/resources.ts`:

| Resource | ID |
|---|---|
| Business | `biz_MIbRyC2ejVkuzs` |
| App | `app_wJzJqgIuWNnbPd` |
| Product | `prod_TR58zZsbQFwJu` |
| 12-Week Plan | `plan_uCovSzsxHgwz2` — $297 one-time (strike-through $397) |
| Monthly Plan | `plan_Svs8MVYQFVs5y` — $49/30 days, 7-day trial |
| Annual Plan | `plan_gvAS7bFXjRnWk` — $399/365 days |
| Founding (hidden) | `plan_kPJlLjFJ88xC5` |
| Cohort Waitlist | `plan_hciTbDQx7X208` |
| Hidden Test | `plan_HJnyQHwV7mnGR` |
| Promo | `promo_9X6Rs6QzxDFI` — code `NORTHSTAR20` |

---

## Webhook Registration

1. Go to **Settings → Webhooks → Add Webhook**
2. URL: `https://northstar-method-fde.whop.site/api/webhooks`
3. Events to subscribe:
   - `payment.succeeded`
   - `membership.activated`
   - `membership.deactivated`
   - `refund.created`
4. Copy the signing secret → set as `WHOP_WEBHOOK_SECRET` Worker secret

---

## Webhook Idempotency (Production)

The in-memory store is **dev/test only**. Production uses a Supabase table with a
unique primary key. Concurrent inserts of the same `webhook-id` cannot both succeed.

```sql
create table if not exists public.webhook_deliveries (
  id text primary key,
  created_at timestamptz not null default now()
);

alter table public.webhook_deliveries enable row level security;
```

Then add Worker secrets:

```bash
whop apps secrets set --secret SUPABASE_URL=https://YOUR-PROJECT.supabase.co
whop apps secrets set --secret SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Without those secrets the Worker fails closed in production.

---

## Pixel Tracking & Event-ID Propagation

### Browser → Server Deduplication

1. User visits page → `view_content` fires (fresh `event_id`)
2. User clicks plan CTA → `add_to_cart` fires (fresh `event_id` stored in `sessionStorage`)
3. Checkout session is created with `metadata.event_id` = that `event_id`
4. User submits checkout → Whop fires `payment.succeeded` webhook
5. Webhook handler reads `event.data.metadata.event_id` and fires a server pixel
   with `event_name="add_to_cart"` and the **same `event_id`**
6. Meta/Whop deduplicates the browser + server signals on `(event_name, event_id)`

### External Advertorial Page

`public/advertorial.html` is a static page that:
- Loads the Whop pixel: `https://t.whop.tw/e/biz_MIbRyC2ejVkuzs.js`
- Calls `window.whop.setScope("biz_MIbRyC2ejVkuzs")` on load
- Fires `view_content`, `lead`, and `add_to_cart` with unique `event_id`s
- Links to `https://northstar-method-fde.whop.site/#pricing`

### Verify in Dashboard

**Northstar Dashboard → Analytics → Pixel Events** should show events from both
the Whop-hosted site and the external advertorial page.

---

## Deployment

```bash
pnpm deploy    # runs: whop apps deploy
```

This builds and uploads to Cloudflare Workers via the Whop CLI.
Worker name: `northstar-method-fde` (set in `wrangler.jsonc`).

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
- Resource IDs: all plan IDs are real, no placeholders can ship (guard test)
- Signature verification (valid, tampered, missing headers)
- Timestamp boundaries (5-minute tolerance, stale, future)
- C1 regression: invalid signature does not consume the webhook ID
- Sequential and concurrent idempotency (MemoryIdempotencyStore)
- Supabase adapter: insert returns row, conflict returns empty, concurrent contention
- Event dispatch: `payment.succeeded` fires `add_to_cart` to `/api/v1/events`
- Tracking utilities (UUID uniqueness, sessionStorage persistence)

---

## Live dashboard (already configured)

Thank-you URL, webhook `hook_Sr9WlFgzJquMb`, affiliates (20% global / 30% member), promo `NORTHSTAR20`, and Meta pixel ID live on `biz_MIbRyC2ejVkuzs`. IDs are in `src/lib/resources.ts`. Worker secrets: `WHOP_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
