import { describe, it, expect, vi } from 'vitest';
import { Webhook } from 'standardwebhooks';
import { verifyWebhookSignature, handleWebhookRequest, dispatchWebhookEvent } from '#/lib/webhook';
import { MemoryIdempotencyStore } from '#/lib/idempotency/memory';
import type { WhopWebhookEnv, WebhookEvent } from '#/lib/webhook';

const TEST_SECRET = 'whsec_' + 'MfKQ9r8GKYqrTwjUPZB2IKfV8KqOPV7YQbOQMSUbpls=';

function nowSec(): number { return Math.floor(Date.now() / 1000); }

interface MkReqOpts { tsOffset?: number; wid?: string; }

async function mkReq(
  body: object,
  env: WhopWebhookEnv,
  opts?: MkReqOpts,
): Promise<Request> {
  const wh = new Webhook(env.WHOP_WEBHOOK_SECRET ?? '');
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

describe('timestamp boundaries', () => {
  it('rejects 6-minute-old timestamp', async () => {
    const req = await mkReq({ type: 'payment', action: 'succeeded', data: {} }, BASE, { tsOffset: -(6 * 60) });
    const resp = await handleWebhookRequest(req, BASE, new MemoryIdempotencyStore());
    expect(resp.status).toBe(401);
  });

  it('rejects 6-minute future timestamp', async () => {
    const req = await mkReq({ type: 'payment', action: 'succeeded', data: {} }, BASE, { tsOffset: 6 * 60 });
    const resp = await handleWebhookRequest(req, BASE, new MemoryIdempotencyStore());
    expect(resp.status).toBe(401);
  });

  it('accepts 4m59s old timestamp (within 5-min tolerance)', async () => {
    const req = await mkReq({ type: 'membership', action: 'activated', data: { id: 'x' } }, BASE, { tsOffset: -(4 * 60 + 59) });
    const resp = await handleWebhookRequest(req, BASE, new MemoryIdempotencyStore());
    expect(resp.status).toBe(200);
  });
});

describe('idempotency', () => {
  it('processes first delivery with status 200', async () => {
    const store = new MemoryIdempotencyStore();
    const req = await mkReq({ type: 'membership', action: 'activated', data: { id: 'm1' } }, BASE);
    expect((await handleWebhookRequest(req, BASE, store)).status).toBe(200);
  });

  it('returns 200 on sequential duplicate', async () => {
    const store = new MemoryIdempotencyStore();
    const body = { type: 'membership', action: 'activated', data: { id: 'm2' } };
    const r1 = await handleWebhookRequest(await mkReq(body, BASE, { wid: 'evt_seq_dup' }), BASE, store);
    expect(r1.status).toBe(200);
    const r2 = await handleWebhookRequest(await mkReq(body, BASE, { wid: 'evt_seq_dup' }), BASE, store);
    expect(r2.status).toBe(200);
    expect(await r2.text()).toBe('Already processed');
  });

  it('handles concurrent duplicates safely', async () => {
    const store = new MemoryIdempotencyStore();
    const body = { type: 'refund', action: 'created', data: { id: 'rf1', amount: 49 } };
    const wid = 'evt_cc';
    const [r1, r2] = await Promise.all([
      handleWebhookRequest(await mkReq(body, BASE, { wid }), BASE, store),
      handleWebhookRequest(await mkReq(body, BASE, { wid }), BASE, store),
    ]);
    const texts = await Promise.all([r1.text(), r2.text()]);
    expect(texts.filter((t) => t === 'Already processed').length).toBe(1);
  });
});

describe('missing Standard Webhooks headers', () => {
  it('returns 400 when webhook-id is absent', async () => {
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

  it('dispatches payment.succeeded and reuses browser event_id for server pixel', async () => {
    const spy = vi.fn().mockResolvedValue({ ok: true } as Response);
    const orig = globalThis.fetch;
    globalThis.fetch = spy;
    const env: WhopWebhookEnv = { ...BASE, WHOP_API_KEY: 'placeholder_key', WHOP_COMPANY_ID: 'biz_test' };
    const evt: WebhookEvent = {
      type: 'payment', action: 'succeeded',
      data: { id: 'pay_1', metadata: { event_id: 'browser-eid-42' }, customer: { email: 'a@b.com', id: 'u1' } },
    };
    await dispatchWebhookEvent(evt, env);
    expect(spy).toHaveBeenCalledOnce();
    const [url, opts] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/server_events');
    const parsed = JSON.parse(opts.body as string);
    expect(parsed.event_id).toBe('browser-eid-42');
    expect(parsed.event_name).toBe('lead');
    globalThis.fetch = orig;
  });

  it('skips server pixel when no event_id in metadata', async () => {
    const spy = vi.fn();
    const orig = globalThis.fetch;
    globalThis.fetch = spy;
    const env: WhopWebhookEnv = { ...BASE, WHOP_API_KEY: 'placeholder_key', WHOP_COMPANY_ID: 'biz_test' };
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
