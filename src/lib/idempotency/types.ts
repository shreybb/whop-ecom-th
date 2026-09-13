/**
 * Idempotency store contract for webhook deduplication.
 *
 * Keyed by the Standard Webhooks `webhook-id` header value.
 * The store must be durable across process restarts in production
 * (Cloudflare KV, D1, or equivalent).
 */
export interface IdempotencyStore {
  /**
   * Returns true if this event_id has already been processed.
   * Must be safe to call concurrently (no TOCTOU races in production).
   */
  has(webhookId: string): Promise<boolean>;

  /**
   * Mark an event_id as processed.
   * @param ttlSeconds - how long to retain the key (default: 86400 = 24h).
   */
  mark(webhookId: string, ttlSeconds?: number): Promise<void>;

  /**
   * Atomically check-and-mark: returns false if already set, true if newly set.
   * Implementations MUST make this atomic to prevent concurrent duplicates.
   */
  checkAndMark(webhookId: string, ttlSeconds?: number): Promise<boolean>;
}
