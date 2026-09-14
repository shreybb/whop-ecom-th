import { describe, it, expect } from 'vitest';
import { createIdempotencyStore } from '#/lib/idempotency/index';
import { MemoryIdempotencyStore } from '#/lib/idempotency/memory';
import { SupabaseIdempotencyStore } from '#/lib/idempotency/supabase';

describe('MemoryIdempotencyStore', () => {
  it('has returns false for unknown key', async () => {
    const store = new MemoryIdempotencyStore();
    expect(await store.has('nonexistent')).toBe(false);
  });

  it('has returns true after mark', async () => {
    const store = new MemoryIdempotencyStore();
    await store.mark('key1');
    expect(await store.has('key1')).toBe(true);
  });

  it('checkAndMark returns true on first call', async () => {
    const store = new MemoryIdempotencyStore();
    expect(await store.checkAndMark('key2')).toBe(true);
  });

  it('checkAndMark returns false on second call for same key', async () => {
    const store = new MemoryIdempotencyStore();
    await store.checkAndMark('key3');
    expect(await store.checkAndMark('key3')).toBe(false);
  });

  it('handles concurrent checkAndMark — exactly one succeeds', async () => {
    const store = new MemoryIdempotencyStore();
    const results = await Promise.all([
      store.checkAndMark('concurrent_key'),
      store.checkAndMark('concurrent_key'),
      store.checkAndMark('concurrent_key'),
    ]);
    const trueCount = results.filter(Boolean).length;
    expect(trueCount).toBe(1);
  });

  it('clear resets state', async () => {
    const store = new MemoryIdempotencyStore();
    await store.mark('k');
    store.clear();
    expect(await store.has('k')).toBe(false);
  });

  it('evicts expired entries', async () => {
    const store = new MemoryIdempotencyStore();
    // mark with 0 TTL (expired immediately)
    await store.mark('expiring', 0);
    // has() calls evict() internally; use a tiny sleep so Date.now() advances
    await new Promise((r) => setTimeout(r, 5));
    expect(await store.has('expiring')).toBe(false);
  });

  it('tracks different keys independently', async () => {
    const store = new MemoryIdempotencyStore();
    await store.mark('a');
    expect(await store.has('a')).toBe(true);
    expect(await store.has('b')).toBe(false);
  });
});

describe('createIdempotencyStore', () => {
  it('uses Supabase when URL and service-role key are set', () => {
    const store = createIdempotencyStore({
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    });
    expect(store).toBeInstanceOf(SupabaseIdempotencyStore);
  });

  it('falls back to memory without credentials outside production', () => {
    const store = createIdempotencyStore({});
    expect(store).toBeInstanceOf(MemoryIdempotencyStore);
  });
});
