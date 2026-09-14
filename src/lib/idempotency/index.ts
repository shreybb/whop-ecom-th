/**
 * Idempotency store factory.
 *
 * Production adapter: SupabaseIdempotencyStore
 *   Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 *   Unique primary-key insert — atomic under concurrent Whop retries.
 *   Fails closed if either env var is missing in production.
 *
 * Dev/test adapter: MemoryIdempotencyStore
 *   In-memory Map with mutex. Not durable.
 */
import { MemoryIdempotencyStore } from "./memory";
import { SupabaseIdempotencyStore } from "./supabase";
import type { IdempotencyStore } from "./types";

export type { IdempotencyStore };
export { MemoryIdempotencyStore } from "./memory";
export { SupabaseIdempotencyStore } from "./supabase";

export interface IdempotencyEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

/** Alias for WhopWebhookEnv until that interface is renamed. */
export type UpstashEnv = IdempotencyEnv;

export function createIdempotencyStore(env?: IdempotencyEnv): IdempotencyStore {
  const url = env?.SUPABASE_URL;
  const key = env?.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    return new SupabaseIdempotencyStore({ url, serviceRoleKey: key });
  }

  const isProduction =
    (typeof process !== "undefined" && process.env["NODE_ENV"] === "production") ||
    (typeof globalThis !== "undefined" &&
      (globalThis as Record<string, unknown>)["IS_CF_WORKER"] === "1");

  if (isProduction) {
    throw new Error(
      "[Northstar] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in production. " +
        "Create a free Supabase project, run the webhook_deliveries table SQL, and add the " +
        "URL plus service-role key as Worker secrets. See README.md § Webhook idempotency.",
    );
  }

  return new MemoryIdempotencyStore();
}
