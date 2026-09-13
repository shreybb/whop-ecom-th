/**
 * Upstash Redis idempotency adapter for production.
 *
 * Uses the Upstash Redis REST API with the `SET key value NX EX <ttl>` command,
 * which is genuinely atomic: Redis evaluates SET NX as a single operation,
 * so concurrent callers cannot both receive "OK". This is the correct semantic
 * for webhook deduplication under concurrent Whop retries.
 *
 * Provisioning:
 *   1. Create a Redis database at console.upstash.com (free tier sufficient).
 *   2. Copy REST URL and REST token from the database dashboard.
 *   3. Set environment variables (see .env.example):
 *        UPSTASH_REDIS_REST_URL=https://<your-db>.upstash.io
 *        UPSTASH_REDIS_REST_TOKEN=<token>
 *   4. In Cloudflare Workers, add them as secrets via wrangler or the dashboard:
 *        wrangler secret put UPSTASH_REDIS_REST_URL
 *        wrangler secret put UPSTASH_REDIS_REST_TOKEN
 *
 * REST API reference:
 *   https://upstash.com/docs/redis/features/restapi
 *   SET: POST /set/<key>/<value>?nx=true&ex=<seconds>
 *        Response {"result":"OK"} on success, {"result":null} if key already existed.
 */
import type { IdempotencyStore } from "./types";

export interface UpstashRedisConfig {
  restUrl: string;
  restToken: string;
}

export class UpstashRedisStore implements IdempotencyStore {
  private readonly restUrl: string;
  private readonly restToken: string;

  constructor(config: UpstashRedisConfig) {
    if (!config.restUrl || !config.restToken) {
      throw new Error(
        "[Northstar] UpstashRedisStore requires both restUrl and restToken. " +
          "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN. See README § Webhook idempotency.",
      );
    }
    this.restUrl = config.restUrl.replace(/\/$/, "");
    this.restToken = config.restToken;
  }

  async has(webhookId: string): Promise<boolean> {
    const result = await this.redisGet(this.key(webhookId));
    return result !== null;
  }

  async mark(webhookId: string, ttlSeconds = 86_400): Promise<void> {
    // SET key value EX <ttl> (unconditional, for explicit mark calls)
    await this.redisCommand(["SET", this.key(webhookId), "1", "EX", String(ttlSeconds)]);
  }

  /**
   * Atomic check-and-mark using Redis SET NX EX.
   * Returns true only if this call was the first to claim the key.
   * Concurrent callers receive false immediately — no races possible.
   */
  async checkAndMark(webhookId: string, ttlSeconds = 86_400): Promise<boolean> {
    const result = await this.redisCommand<string | null>([
      "SET",
      this.key(webhookId),
      "1",
      "NX",
      "EX",
      String(ttlSeconds),
    ]);
    // Redis returns "OK" when the key was newly set, null when NX blocked it.
    return result === "OK";
  }

  private key(webhookId: string): string {
    return `ns:whook:${webhookId}`;
  }

  private authHeader(): string {
    return ["Bearer", this.restToken].join(" ");
  }

  private async redisGet(key: string): Promise<string | null> {
    const resp = await fetch(`${this.restUrl}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: this.authHeader() },
    });
    if (!resp.ok) throw new Error(`[Northstar] Upstash GET failed: ${resp.status}`);
    const body = (await resp.json()) as { result: string | null };
    return body.result;
  }

  private async redisCommand<T = unknown>(args: string[]): Promise<T> {
    const resp = await fetch(`${this.restUrl}`, {
      method: "POST",
      headers: {
        Authorization: this.authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
    if (!resp.ok) throw new Error(`[Northstar] Upstash command failed: ${resp.status}`);
    const body = (await resp.json()) as { result: T };
    return body.result;
  }
}
