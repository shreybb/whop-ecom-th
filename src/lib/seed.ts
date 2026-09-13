import type { Product } from "#/lib/catalog";

/**
 * Seed products used when no live plans exist yet.
 * Plan IDs are read from env vars (WHOP_PLAN_12WK, WHOP_PLAN_MONTHLY, WHOP_PLAN_YEARLY).
 * These placeholders keep the UI functional before dashboard setup.
 */
function p(
  handle: string,
  title: string,
  description: string,
  price: number,
  planId: string,
  planType: string,
  collection = "programs",
): Product {
  return {
    id: `local_${handle}`,
    handle,
    title,
    description,
    price,
    currency: "USD",
    image: "/hero-bg.jpg",
    collection,
    planId,
    planType,
  };
}

function envPlanId(envKey: string, fallback: string): string {
  // In Cloudflare Workers the env is injected at runtime, not available here at module scope.
  // The catalog.server.ts will use live Whop data if plans exist; seed is the fallback.
  return typeof process !== "undefined" ? (process.env[envKey] ?? fallback) : fallback;
}

export const seedProducts: Product[] = [
  p(
    "northstar-12wk",
    "Northstar 12-Week Program",
    "A complete 12-week fitness transformation: training plans, nutrition coaching, and a private community.",
    297,
    envPlanId("WHOP_PLAN_12WK", "plan_REPLACE_12WK"),
    "one_time",
  ),
  p(
    "northstar-monthly",
    "Northstar Monthly",
    "Full program access plus weekly live Q&A and direct coach messaging. Includes a 7-day free trial.",
    49,
    envPlanId("WHOP_PLAN_MONTHLY", "plan_REPLACE_MONTHLY"),
    "recurring",
  ),
  p(
    "northstar-yearly",
    "Northstar Annual",
    "Best value. Everything in Monthly plus a 1-on-1 strategy session and priority support.",
    399,
    envPlanId("WHOP_PLAN_YEARLY", "plan_REPLACE_YEARLY"),
    "recurring",
  ),
];
