import { describe, it, expect } from 'vitest';
import { generateEventId, trackViewContent, trackLead, trackAddToCart, SESSION_CHECKOUT_EVENT_ID_KEY } from '#/lib/tracking';

// Mock sessionStorage and window.whop
const storage = new Map<string, string>();
Object.defineProperty(globalThis, 'sessionStorage', {
  value: {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => storage.set(k, v),
    removeItem: (k: string) => storage.delete(k),
    clear: () => storage.clear(),
  },
  writable: true,
});

const trackCalls: Array<{ event: string; data: Record<string, unknown> }> = [];
Object.defineProperty(globalThis, 'window', {
  value: {
    whop: {
      track: (event: string, data: Record<string, unknown>) => { trackCalls.push({ event, data }); },
    },
    sessionStorage: globalThis.sessionStorage,
  },
  writable: true,
});

describe('generateEventId', () => {
  it('returns a non-empty string', () => {
    expect(generateEventId().length).toBeGreaterThan(0);
  });

  it('returns unique IDs on repeated calls', () => {
    const ids = Array.from({ length: 100 }, () => generateEventId());
    const unique = new Set(ids);
    expect(unique.size).toBe(100);
  });

  it('returns UUID v4 format', () => {
    const id = generateEventId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});

describe('trackViewContent', () => {
  it('calls whop.track with view_content and an event_id', () => {
    trackCalls.length = 0;
    const eid = trackViewContent({ page: 'home' });
    expect(eid.length).toBeGreaterThan(0);
    expect(trackCalls.at(-1)?.event).toBe('view_content');
    expect(trackCalls.at(-1)?.data.event_id).toBe(eid);
  });
});

describe('trackLead', () => {
  it('calls whop.track with lead event and email', () => {
    trackCalls.length = 0;
    const eid = trackLead('test@example.com', { source: 'modal' });
    expect(trackCalls.at(-1)?.event).toBe('lead');
    expect(trackCalls.at(-1)?.data.email).toBe('test@example.com');
    expect(trackCalls.at(-1)?.data.event_id).toBe(eid);
  });
});

describe('trackAddToCart', () => {
  it('calls whop.track with add_to_cart event and plan_id', () => {
    trackCalls.length = 0;
    const planId = 'plan_test123';
    const eid = trackAddToCart(planId, { value: 297 });
    expect(trackCalls.at(-1)?.event).toBe('add_to_cart');
    expect(trackCalls.at(-1)?.data.plan_id).toBe(planId);
    expect(trackCalls.at(-1)?.data.event_id).toBe(eid);
  });

  it('persists event_id in sessionStorage for server-side deduplication', () => {
    storage.clear();
    const planId = 'plan_test456';
    const eid = trackAddToCart(planId);
    expect(storage.get(SESSION_CHECKOUT_EVENT_ID_KEY)).toBe(eid);
  });

  it('generates unique event_id per call', () => {
    const ids = [trackAddToCart('p1'), trackAddToCart('p2'), trackAddToCart('p3')];
    const unique = new Set(ids);
    expect(unique.size).toBe(3);
  });
});
