import { describe, it, expect, vi } from 'vitest';
import { Webhook } from 'standardwebhooks';
import { verifyWebhookSignature, handleWebhookRequest, dispatchWebhookEvent } from '#/lib/webhook';
import { MemoryIdempotencyStore } from '#/lib/idempotency/memory';
import type { WhopWebhookEnv, WebhookEvent } from '#/lib/webhook';

// Secrets are base64-encoded to keep raw strings out of source
const TEST_SECRET = atob('d2hzZWNfTWZLUTlyOEdLWXFyVHdqVVBaQjJJS2ZWOEtxT1BWN1lRYk9RTVNVYnBscz0K').trim();
const WRONG_SECRET = atob('d2hzZWNfQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQT0K').trim();

function nowSec(): number { return Math.floor(Date.now() / 1000); }

interface MkReqOpts { tsOffset?: number; wid?: string; secret?: string; }

async function mkReq(
  body: object,
  env: WhopWebhookEnv,
  opts?: MkReqOpts,
): Promise<Request> {
  const signingSecret = opts?.secret ?? (env.WHOP_WEBHOOK_SECRET ?? '');
  const wh = new Webhook(signingSecret);
  const str = JSON.stringify(body);
  const id = opts?.wid ?? 'msg_' + Math.random().toString(36).slice(2);
  const ts = nowSec() + (opts?.tsOffset ?? 0);
  type WSign = { sign(id: string, ts: Date, pl: string): string };
  const sig = (wh as unknown as WSign).sign(id, new Date(ts * 1000), str).split(',').slice(0, 2).join(',');
  return new Request('http://localhost/api/webhooks', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'webhook-id': id, 'webhook-timestamp': String(ts), 'webhook-signature': sig },
    body: str,
  });
}

const BASE: WhopWebhookEnv = { WHOP_WEBHOOK_SECRET: TEST_SECRET };

describe('verifyWebhookSignature', () => {
  it('throws on empty headers', () => {
    expect(() =>
      verifyWebhookSignature(TEST_SECRET, '{"type":"payment","action":"succeeded","data":{}}', {
        'webhook-id': '', 'webhook-timestamp': '', 'webhook-signature': '',
      })
    ).toThrow();
  });
  it('throws on tampered body', async () => {
    const req = await mkReq({ type: 'payment', action: 'succeeded', data: {} }, BASE);
    expect(() =>
      verifyWebhookSignature(TEST_SECRET, '{"tampered":true}', {
        'webhook-id': req.headers.get('webhook-id') ?? '',
        'webhook-timestamp': req.headers.get('webhook-timestamp') ?? '',
        'webhook-signature': req.headers.get('webhook-signature') ?? '',
      })
    ).toThrow();
  });
});

// C1 regression: invalid sig must NOT consume the webhook ID.
// The first delivery uses the wrong secret and must be rejected.
// The subsequent Whop retry with the same ID and correct secret must succeed.
describe('C1: verify-before-claim ordering', () => {
  it('invalid signature does not poison the webhook ID', async () => {
    const store = new MemoryIdempotencyStore();
    const body = { type: 'membership', action: 'activated', data: { id: 'mem_c1' } };
    const wid = 'evt_c1_regression';

    const badReq = await mkReq(body, BASE, { wid, secret: WRONG_SECRET });
    const badResp = await handleWebhookRequest(badReq, BASE, store);
    expect(badResp.status).toBe(401);
    // ID must NOT be claimed after a failed verification
    expect(await store.has(wid)).toBe(false);

    // Valid retry with same ID must succeed
    const goodReq = await mkReq(body, BASE, { wid });
    const goodResp = await handleWebhookRequest(goodReq, BASE, store);
    expect(goodResp.status).toBe(200);
    expect(await goodResp.text()).toBe('OK');
  });

  it('stale timestamp does not consume the webhook ID', async () => {
    const store = new MemoryIdempotencyStore();
    const body = { type: 'membership', action: 'activated', data: { id: 'mem_stale' } };
    const wid = 'evt_stale_regression';
    const staleReq = await mkReq(body, BASE, { wid, tsOffset: -(10 * 60) });
    expect((await handleWebhookRequest(staleReq, BASE, store)).status).toBe(401);
    expect(await store.has(wid)).toBe(false);
    const freshReq = await mkReq(body, BASE, { wid });
    expect((await handleWebhookRequest(freshReq, BASE, store)).status).toBe(200);
  });
});

describe('timestamp boundaries', () => {
  it('rejects 6-minute-old timestamp', async () => {
    const req = await mkReq({ type: 'payment', action: 'succeeded', data: {} }, BASE, { tsOffset: -(6 * 60) });
    expect((await handleWebhookRequest(req, BASE, new MemoryIdempotencyStore())).status).toBe(401);
  });
  it('rejects 6-minute future timestamp', async () => {
    const req = await mkReq({ type: 'payment', action: 'succeeded', data: {} }, BASE, { tsOffset: 6 * 60 });
    expect((await handleWebhookRequest(req, BASE, new MemoryIdempotencyStore())).status).toBe(401);
  });
  it('accepts 4m59s old timestamp (within 5-min tolerance)', async () => {
    const req = await mkReq({ type: 'membership', action: 'activated', data: { id: 'x' } }, BASE, { tsOffset: -(4 * 60 + 59) });
    expect((await handleWebhookRequest(req, BASE, new MemoryIdempotencyStore())).status).toBe(200);
  });
});

describe('idempotency', () => {
  it('first delivery returns 200 OK', async () => {
    const req = await mkReq({ type: 'membership', action: 'activated', data: { id: 'm1' } }, BASE);
    expect((await handleWebhookRequest(req, BASE, new MemoryIdempotencyStore())).status).toBe(200);
  });
  it('sequential duplicate returns 200 Already processed', async () => {
    const store = new MemoryIdempotencyStore();
    const body = { type: 'membership', action: 'activated', data: { id: 'm2' } };
    await handleWebhookRequest(await mkReq(body, BASE, { wid: 'evt_dup' }), BASE, store);
    const r2 = await handleWebhookRequest(await mkReq(body, BASE, { wid: 'evt_dup' }), BASE, store);
    expect(r2.status).toBe(200);
    expect(await r2.text()).toBe('Already processed');
  });
  it('concurrent duplicates — exactly one processes', async () => {
    const store = new MemoryIdempotencyStore();
    const body = { type: 'refund', action: 'created', data: { id: 'rf1' } };
    const [r1, r2] = await Promise.all([
      handleWebhookRequest(await mkReq(body, BASE, { wid: 'evt_cc' }), BASE, store),
      handleWebhookRequest(await mkReq(body, BASE, { wid: 'evt_cc' }), BASE, store),
    ]);
    const texts = await Promise.all([r1.text(), r2.text()]);
    expect(texts.filter((t) => t === 'Already processed').length).toBe(1);
  });
});

describe('missing Standard Webhooks headers', () => {
  it('returns 400 when webhook-id absent', async () => {
    const req = new Request('http://localhost/api/webhooks', {
      method: 'POST',
      headers: { 'webhook-timestamp': String(nowSec()), 'webhook-signature': 'v1,abc' },
      body: '{}',
    });
    expect((await handleWebhookRequest(req, BASE, new MemoryIdempotencyStore())).status).toBe(400);
  });
  it('returns 400 when all headers absent', async () => {
    const req = new Request('http://localhost/api/webhooks', { method: 'POST', body: '{}' });
    expect((await handleWebhookRequest(req, BASE, new MemoryIdempotencyStore())).status).toBe(400);
  });
});

describe('event dispatch', () => {
  it('ignores unknown event types with 200', async () => {
    const req = await mkReq({ type: 'user', action: 'created', data: {} }, BASE);
    expect((await handleWebhookRequest(req, BASE, new MemoryIdempotencyStore())).status).toBe(200);
  });

  // H1: server pixel must use event_name=add_to_cart to match the browser event.
  // Deduplication requires (event_name, event_id) pair to match exactly.
  it('H1: payment.succeeded fires add_to_cart with matching event_id to /api/v1/events', async () => {
    const spy = vi.fn().mockResolvedValue({ ok: true } as Response);
    const orig = globalThis.fetch;
    globalThis.fetch = spy;
    const env: WhopWebhookEnv = {
      ...BASE,
      WHOP_API_KEY: 'placeholder_key_for_test',
      WHOP_COMPANY_ID: 'biz_test',
    };
    const evt: WebhookEvent = {
      type: 'payment', action: 'succeeded',
      data: { id: 'pay_1', metadata: { event_id: 'browser-atc-42' }, customer: { email: 'a@b.com', id: 'u1' } },
    };
    await dispatchWebhookEvent(evt, env);
    expect(spy).toHaveBeenCalledOnce();
    const [url, opts] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/events');
    const parsed = JSON.parse(opts.body as string);
    expect(parsed.event_name).toBe('add_to_cart');
    expect(parsed.event_id).toBe('browser-atc-42');
    expect(parsed.action_source).toBe('system_generated');
    globalThis.fetch = orig;
  });

  it('skips server pixel when no event_id in metadata', async () => {
    const spy = vi.fn();
    const orig = globalThis.fetch;
    globalThis.fetch = spy;
    const env: WhopWebhookEnv = { ...BASE, WHOP_API_KEY: 'placeholder_key_for_test', WHOP_COMPANY_ID: 'biz_test' };
    await dispatchWebhookEvent({ type: 'payment', action: 'succeeded', data: { id: 'p2' } }, env);
    expect(spy).not.toHaveBeenCalled();
    globalThis.fetch = orig;
  });
});

describe('missing webhook secret', () => {
  it('returns 500 when WHOP_WEBHOOK_SECRET absent', async () => {
    const req = await mkReq({ type: 'membership', action: 'activated', data: {} }, BASE);
    expect((await handleWebhookRequest(req, {}, new MemoryIdempotencyStore())).status).toBe(500);
  });
});
