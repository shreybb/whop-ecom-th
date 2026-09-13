/**
 * Idempotency store factory.
 *
 * In production (Cloudflare Workers), pass the KV namespace binding.
 * In development and tests, falls back to the in-memory adapter.
 *
 * IMPORTANT: Production MUST provide a KV binding. If no KV binding is found
 * in a production environment (NODE_ENV=production or IS_CF_WORKER=1), the
 * factory throws so that misconfiguration is caught at startup, not at runtime.
 */
import { MemoryIdempotencyStore } from "./memory";
import { CloudflareKVStore, type KVNamespace } from "./cloudflare-kv";
import type { IdempotencyStore } from "./types";

export type { IdempotencyStore };
export { MemoryIdempotencyStore } from "./memory";
export { CloudflareKVStore } from "./cloudflare-kv";

/**
 * Create the appropriate idempotency store.
 *
 * @param kvBinding - Cloudflare KV namespace from the Worker env (env.IDEMPOTENCY_KV).
 *                    Omit to use the in-memory store (dev/test only).
 */
export function createIdempotencyStore(kvBinding?: KVNamespace): IdempotencyStore {
  if (kvBinding) {
    return new CloudflareKVStore(kvBinding);
  }

  const isProduction =
    (typeof process !== "undefined" && process.env["NODE_ENV"] === "production") ||
    (typeof globalThis !== "undefined" && (globalThis as Record<string, unknown>)["IS_CF_WORKER"] === "1");

  if (isProduction) {
    throw new Error(
      "[Northstar] IDEMPOTENCY_KV binding is required in production. " +
        "Add a KV namespace named IDEMPOTENCY_KV to wrangler.jsonc and provision it. " +
        "See README.md § Webhook idempotency.",
    );
  }

  return new MemoryIdempotencyStore();
}
