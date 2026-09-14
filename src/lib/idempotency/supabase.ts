/**
 * Supabase/Postgres idempotency adapter.
 *
 * Claims are a unique primary-key insert:
 *   INSERT INTO webhook_deliveries (id) VALUES ($1)
 *   ON CONFLICT DO NOTHING
 *   RETURNING id
 *
 * Postgres evaluates that as one statement. Two concurrent Whop retries
 * cannot both receive a row. PostgREST exposes the same semantics via
 * `Prefer: resolution=ignore-duplicates` — a 201 with a body means this
 * caller won; a 201 with an empty array means the ID was already claimed.
 */
import type { IdempotencyStore } from "./types";

export interface SupabaseIdempotencyConfig {
  url: string;
  serviceRoleKey: string;
}

const TABLE = "webhook_deliveries";

export class SupabaseIdempotencyStore implements IdempotencyStore {
  private readonly restUrl: string;
  private readonly serviceRoleKey: string;

  constructor(config: SupabaseIdempotencyConfig) {
    if (!config.url || !config.serviceRoleKey) {
      throw new Error(
        "[Northstar] SupabaseIdempotencyStore requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      );
    }
    this.restUrl = config.url.replace(/\/$/, "") + "/rest/v1/" + TABLE;
    this.serviceRoleKey = config.serviceRoleKey;
  }

  async has(webhookId: string): Promise<boolean> {
    const resp = await fetch(
      this.restUrl + "?id=eq." + encodeURIComponent(webhookId) + "&select=id",
      { headers: this.headers() },
    );
    if (!resp.ok) throw new Error("[Northstar] Supabase has() failed: " + resp.status);
    const rows = (await resp.json()) as Array<{ id: string }>;
    return rows.length > 0;
  }

  async mark(webhookId: string): Promise<void> {
    await this.checkAndMark(webhookId);
  }

  async checkAndMark(webhookId: string): Promise<boolean> {
    const resp = await fetch(this.restUrl, {
      method: "POST",
      headers: {
        ...this.headers(),
        Prefer: "return=representation,resolution=ignore-duplicates",
      },
      body: JSON.stringify({ id: webhookId }),
    });
    if (!resp.ok) throw new Error("[Northstar] Supabase checkAndMark failed: " + resp.status);
    const rows = (await resp.json()) as Array<{ id: string }>;
    return rows.length === 1;
  }

  private headers(): Record<string, string> {
    return {
      apikey: this.serviceRoleKey,
      Authorization: "Bearer " + this.serviceRoleKey,
      "Content-Type": "application/json",
    };
  }
}
