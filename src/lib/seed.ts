import type { Product } from "#/lib/catalog";
import { NORTHSTAR_RESOURCES } from "#/lib/resources";

/**
 * Seed products — used as fallback when the Whop API is unavailable.
 *
 * Plan IDs come from NORTHSTAR_RESOURCES (committed, not secret) so the
 * correct checkout links are always present in the browser, whether the
 * live Whop catalogue loaded or not.
 *
 * NOTE: process.env is NOT used here. Cloudflare Worker runtime secrets
 * are not available at module scope during the client bundle, so env-var
 * lookups at this level would silently fall back to placeholders. Real
 * IDs are committed as public resource identifiers in resources.ts.
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

export const seedProducts: Product[] = [
  p(
    "northstar-12wk",
    "Northstar 12-Week Program",
    "A complete 12-week fitness transformation: training plans, nutrition coaching, and a private community.",
    297,
    NORTHSTAR_RESOURCES.plans.twelveWeek,
    "one_time",
  ),
  p(
    "northstar-monthly",
    "Northstar Monthly",
    "Full program access plus weekly live Q&A and direct coach messaging. Includes a 7-day free trial.",
    49,
    NORTHSTAR_RESOURCES.plans.monthly,
    "recurring",
  ),
  p(
    "northstar-yearly",
    "Northstar Annual",
    "Best value. Everything in Monthly plus a 1-on-1 strategy session and priority support.",
    399,
    NORTHSTAR_RESOURCES.plans.yearly,
    "recurring",
  ),
];
