import { describe, it, expect, vi } from 'vitest';
import { handleWebhookRequest, dispatchWebhookEvent, webhookEventName, verifierSecret } from '#/lib/webhook';
import { MemoryIdempotencyStore } from '#/lib/idempotency/memory';
import { Webhook } from 'standardwebhooks';
import type { WhopWebhookEnv, WebhookEvent } from '#/lib/webhook';

const TEST_SECRET = atob('d2hzZWNfTWZLUTlyOEdLWXFyVHdqVVBaQjJJS2ZWOEtxT1BWN1lRYk9RTVNVYnBscz0K').trim();
const BASE: WhopWebhookEnv = { WHOP_WEBHOOK_SECRET: TEST_SECRET };

async function signedRequest(body: object): Promise<Request> {
  const wh = new Webhook(TEST_SECRET);
  const str = JSON.stringify(body);
  const id = 'msg_official_' + Math.random().toString(36).slice(2);
  const ts = Math.floor(Date.now() / 1000);
  type WSign = { sign(id: string, ts: Date, pl: string): string };
  const sig = (wh as unknown as WSign).sign(id, new Date(ts * 1000), str).split(',').slice(0, 2).join(',');
  return new Request('http://localhost/api/webhooks', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'webhook-id': id,
      'webhook-timestamp': String(ts),
      'webhook-signature': sig,
    },
    body: str,
  });
}

describe('official Whop envelope', () => {
  it('accepts dotted type without an action field', async () => {
    const req = await signedRequest({ type: 'membership.activated', data: { id: 'mem_official' } });
    expect((await handleWebhookRequest(req, BASE, new MemoryIdempotencyStore())).status).toBe(200);
  });

  it('webhookEventName reads current and split envelopes', () => {
    expect(webhookEventName({ type: 'payment.succeeded' })).toBe('payment.succeeded');
    expect(webhookEventName({ type: 'payment', action: 'succeeded' })).toBe('payment.succeeded');
  });

  it('base64-encodes ws_ secrets for standardwebhooks', () => {
    const raw = 'ws_' + '0'.repeat(64);
    expect(verifierSecret(raw)).toBe(btoa(raw));
    expect(verifierSecret(TEST_SECRET)).toBe(TEST_SECRET);
  });

  it('dispatches payment.succeeded from dotted type', async () => {
    const spy = vi.fn().mockResolvedValue({ ok: true } as Response);
    const orig = globalThis.fetch;
    globalThis.fetch = spy;
    const env: WhopWebhookEnv = {
      ...BASE,
      WHOP_API_KEY: 'placeholder_key_for_test',
      WHOP_COMPANY_ID: 'biz_test',
    };
    const evt: WebhookEvent = {
      type: 'payment.succeeded',
      data: { id: 'pay_1', metadata: { event_id: 'browser-atc-42' }, customer: { email: 'a@b.com', id: 'u1' } },
    };
    await dispatchWebhookEvent(evt, env);
    expect(spy).toHaveBeenCalledOnce();
    globalThis.fetch = orig;
  });
});
