import { describe, it, expect, vi } from "vitest";
import { SupabaseIdempotencyStore } from "#/lib/idempotency/supabase";

function storeWith(bodies: unknown[], status = 201): SupabaseIdempotencyStore {
  let call = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(() => {
      const body = bodies[call++] ?? [];
      return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(body),
      } as Response);
    }),
  );
  return new SupabaseIdempotencyStore({
    url: "https://example.supabase.co",
    serviceRoleKey: "service-role",
  });
}

describe("SupabaseIdempotencyStore", () => {
  it("checkAndMark returns true when insert returns the row", async () => {
    const store = storeWith([[{ id: "wid_1" }]]);
    expect(await store.checkAndMark("wid_1")).toBe(true);
    vi.unstubAllGlobals();
  });

  it("checkAndMark returns false when conflict returns no row", async () => {
    const store = storeWith([[]]);
    expect(await store.checkAndMark("wid_dup")).toBe(false);
    vi.unstubAllGlobals();
  });

  it("concurrent checkAndMark — exactly one returns true", async () => {
    const bodies = [[{ id: "evt_concurrent" }], []];
    let call = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        const body = bodies[call++];
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve(body),
        } as Response);
      }),
    );
    const store = new SupabaseIdempotencyStore({
      url: "https://example.supabase.co",
      serviceRoleKey: "service-role",
    });
    const [r1, r2] = await Promise.all([
      store.checkAndMark("evt_concurrent"),
      store.checkAndMark("evt_concurrent"),
    ]);
    expect([r1, r2].filter(Boolean).length).toBe(1);
    vi.unstubAllGlobals();
  });

  it("has returns true when a row exists", async () => {
    const store = storeWith([[{ id: "wid_exists" }]], 200);
    expect(await store.has("wid_exists")).toBe(true);
    vi.unstubAllGlobals();
  });

  it("has returns false when no row exists", async () => {
    const store = storeWith([[]], 200);
    expect(await store.has("wid_absent")).toBe(false);
    vi.unstubAllGlobals();
  });

  it("throws when constructed without credentials", () => {
    expect(() => new SupabaseIdempotencyStore({ url: "", serviceRoleKey: "" })).toThrow();
  });
});
