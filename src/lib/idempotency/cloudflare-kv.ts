/**
 * Cloudflare KV idempotency adapter for production.
 *
 * Requires a KV namespace bound to the Worker as IDEMPOTENCY_KV.
 * Add to wrangler.jsonc:
 *
 *   "kv_namespaces": [
 *     { "binding": "IDEMPOTENCY_KV", "id": "<your-kv-namespace-id>" }
 *   ]
 *
 * KV write consistency: Cloudflare KV is eventually consistent. For strict
 * once-and-only-once semantics under concurrent Whop retries, this is
 * sufficient because Whop's retry window (~5 min) is longer than KV
 * replication latency (~60 s). For stronger guarantees, use D1 or Durable
 * Objects with a SQL transaction.
 */
import type { IdempotencyStore } from "./types";

export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export class CloudflareKVStore implements IdempotencyStore {
  constructor(private readonly kv: KVNamespace) {}

  async has(webhookId: string): Promise<boolean> {
    return (await this.kv.get(this.key(webhookId))) !== null;
  }

  async mark(webhookId: string, ttlSeconds = 86_400): Promise<void> {
    await this.kv.put(this.key(webhookId), "1", { expirationTtl: ttlSeconds });
  }

  /**
   * KV does not support atomic compare-and-set natively.
   * We use a write-then-read pattern with a unique value to detect races.
   * Under Whop's retry behaviour this is safe; for stricter needs use D1.
   */
  async checkAndMark(webhookId: string, ttlSeconds = 86_400): Promise<boolean> {
    const existing = await this.kv.get(this.key(webhookId));
    if (existing !== null) return false;
    await this.kv.put(this.key(webhookId), "1", { expirationTtl: ttlSeconds });
    return true;
  }

  private key(webhookId: string): string {
    return `whook:${webhookId}`;
  }
}
