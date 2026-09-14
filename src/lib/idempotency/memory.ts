/**
 * In-memory idempotency store for local development and tests ONLY.
 *
 * WARNING: This store does NOT survive process restarts and is NOT safe for
 * production use. It will allow duplicate events after a restart.
 * Use SupabaseIdempotencyStore in production.
 */
import type { IdempotencyStore } from "./types";

interface Entry {
  expiresAt: number;
}

export class MemoryIdempotencyStore implements IdempotencyStore {
  private readonly map = new Map<string, Entry>();
  /** Mutex map to prevent concurrent duplicate processing. */
  private readonly inFlight = new Map<string, Promise<boolean>>();

  async has(webhookId: string): Promise<boolean> {
    this.evict();
    return this.map.has(webhookId);
  }

  async mark(webhookId: string, ttlSeconds = 86_400): Promise<void> {
    this.map.set(webhookId, { expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async checkAndMark(webhookId: string, ttlSeconds = 86_400): Promise<boolean> {
    // If a concurrent call is already working on this id, await it and return false.
    const existing = this.inFlight.get(webhookId);
    if (existing) {
      await existing;
      return false;
    }

    let resolve!: (v: boolean) => void;
    const promise = new Promise<boolean>((res) => { resolve = res; });
    this.inFlight.set(webhookId, promise);

    try {
      this.evict();
      if (this.map.has(webhookId)) {
        resolve(false);
        return false;
      }
      this.map.set(webhookId, { expiresAt: Date.now() + ttlSeconds * 1000 });
      resolve(true);
      return true;
    } finally {
      this.inFlight.delete(webhookId);
    }
  }

  /** Remove expired entries to prevent unbounded memory growth. */
  private evict(): void {
    const now = Date.now();
    for (const [key, entry] of this.map) {
      if (entry.expiresAt <= now) this.map.delete(key);
    }
  }

  /** For tests: reset state between cases. */
  clear(): void {
    this.map.clear();
    this.inFlight.clear();
  }
}
