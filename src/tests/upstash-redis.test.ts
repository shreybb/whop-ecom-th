import { describe, it, expect, vi } from 'vitest';
import { UpstashRedisStore } from '#/lib/idempotency/upstash-redis';

// Mock fetch to simulate Upstash REST API responses.
function makeStore(responses: Array<{ result: string | null }>) {
  let call = 0;
  vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
    const result = responses[call++] ?? { result: null };
    return Promise.resolve({ ok: true, json: () => Promise.resolve(result) } as Response);
  }));
  return new UpstashRedisStore({ restUrl: 'https://redis.example.com', restToken: 'tok' });
}

describe('UpstashRedisStore', () => {
  it('checkAndMark returns true when Redis responds OK (new key)', async () => {
    const store = makeStore([{ result: 'OK' }]);
    expect(await store.checkAndMark('wid_1')).toBe(true);
    vi.unstubAllGlobals();
  });

  it('checkAndMark returns false when Redis responds null (key exists)', async () => {
    const store = makeStore([{ result: null }]);
    expect(await store.checkAndMark('wid_dup')).toBe(false);
    vi.unstubAllGlobals();
  });

  // Atomic contention: concurrent calls both hit Redis.
  // Redis guarantees only one gets OK; the other gets null.
  it('concurrent checkAndMark — exactly one returns true', async () => {
    let call = 0;
    const results: Array<{ result: string | null }> = [{ result: 'OK' }, { result: null }];
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      const result = results[call++];
      return Promise.resolve({ ok: true, json: () => Promise.resolve(result) } as Response);
    }));
    const store = new UpstashRedisStore({ restUrl: 'https://redis.example.com', restToken: 'tok' });
    const [r1, r2] = await Promise.all([
      store.checkAndMark('evt_concurrent'),
      store.checkAndMark('evt_concurrent'),
    ]);
    expect([r1, r2].filter(Boolean).length).toBe(1);
    vi.unstubAllGlobals();
  });

  it('has returns true when key exists', async () => {
    const store = makeStore([{ result: '1' }]);
    expect(await store.has('wid_exists')).toBe(true);
    vi.unstubAllGlobals();
  });

  it('has returns false when key absent', async () => {
    const store = makeStore([{ result: null }]);
    expect(await store.has('wid_absent')).toBe(false);
    vi.unstubAllGlobals();
  });

  it('throws when constructed without credentials', () => {
    expect(() => new UpstashRedisStore({ restUrl: '', restToken: '' })).toThrow();
  });
});