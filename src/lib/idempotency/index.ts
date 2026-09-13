/**
 * Idempotency store factory.
 *
 * Production adapter: UpstashRedisStore
 *   Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
 *   Uses Redis SET NX EX — genuinely atomic, no TOCTOU races.
 *   Fails closed (throws) if either env var is missing in production.
 *
 * Dev/test adapter: MemoryIdempotencyStore
 *   In-memory Map with mutex for concurrent calls. Not durable — dev/test only.
 */
import { MemoryIdempotencyStore } from "./memory";
import { UpstashRedisStore } from "./upstash-redis";
import type { IdempotencyStore } from "./types";

export type { IdempotencyStore };
export { MemoryIdempotencyStore } from "./memory";
export { UpstashRedisStore } from "./upstash-redis";

export interface UpstashEnv {
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
}

/**
 * Create the appropriate idempotency store.
 *
 * @param env - Worker env object. If UPSTASH_REDIS_REST_URL and
 *              UPSTASH_REDIS_REST_TOKEN are present, returns UpstashRedisStore.
 *              Otherwise falls back to MemoryIdempotencyStore, but throws in
 *              production to prevent silent data loss.
 */
export function createIdempotencyStore(env?: UpstashEnv): IdempotencyStore {
  const url = env?.UPSTASH_REDIS_REST_URL;
  const token = env?.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    return new UpstashRedisStore({ restUrl: url, restToken: token });
  }

  const isProduction =
    (typeof process !== "undefined" && process.env["NODE_ENV"] === "production") ||
    (typeof globalThis !== "undefined" &&
      (globalThis as Record<string, unknown>)["IS_CF_WORKER"] === "1");

  if (isProduction) {
    throw new Error(
      "[Northstar] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required in production. " +
        "Create a free Upstash Redis database and add the credentials as Worker secrets. " +
        "See README.md § Webhook idempotency.",
    );
  }

  return new MemoryIdempotencyStore();
}
