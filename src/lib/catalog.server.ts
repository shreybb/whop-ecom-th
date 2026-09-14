import type { Product } from "#/lib/catalog";
import { NORTHSTAR_RESOURCES } from "#/lib/resources";
import { seedProducts } from "#/lib/seed";
import { loadAccountId } from "#/lib/brand.server";
import { listAll } from "#/lib/whop.server";

const FRESH_MS = 60_000;

type RawPlan = {
  id?: unknown;
  title?: unknown;
  initial_price?: unknown;
  renewal_price?: unknown;
  currency?: unknown;
  visibility?: unknown;
  plan_type?: unknown;
  product?: { id?: unknown } | string | null;
  trial_period_days?: unknown;
  billing_period?: unknown;
};
type RawProduct = {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  visibility?: unknown;
  route?: unknown;
  labels?: unknown;
  default_plan?: RawPlan | null;
};

function moneyAmount(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "amount" in value) {
    return Number((value as { amount: unknown }).amount);
  }
  return 0;
}

function moneyCurrency(value: unknown, fallback = "USD"): string {
  if (typeof value === "string" && value) return value.toUpperCase();
  if (value && typeof value === "object" && "currency" in value) {
    const currency = (value as { currency?: unknown }).currency;
    if (typeof currency === "string" && currency) return currency.toUpperCase();
  }
  return fallback;
}

function productIdOf(plan: RawPlan): string {
  if (typeof plan.product === "string") return plan.product;
  if (plan.product && typeof plan.product.id === "string") return plan.product.id;
  return "";
}

/**
 * Storefront always exposes the three public Northstar plans (seed handles).
 * Live API prices overlay when those plan IDs exist; leftover Academy products
 * (Starter / Pro / Mentor) stay off the homepage.
 */
export function buildStorefrontCatalog(rawProducts: RawProduct[], rawPlans: RawPlan[]): Product[] {
  const northstar = rawProducts.find((row) => String(row.id) === NORTHSTAR_RESOURCES.productId);
  return seedProducts.map((seed) => {
    const livePlan = rawPlans.find((plan) => plan.id === seed.planId);
    if (!livePlan) return seed;
    const liveProduct =
      northstar
      ?? rawProducts.find((row) => productIdOf(livePlan) === String(row.id));
    return {
      ...seed,
      id: liveProduct ? String(liveProduct.id) : seed.id,
      price: moneyAmount(livePlan.renewal_price) || moneyAmount(livePlan.initial_price) || seed.price,
      currency: moneyCurrency(livePlan.initial_price, moneyCurrency(livePlan.currency, seed.currency)),
      trialDays: typeof livePlan.trial_period_days === "number" ? livePlan.trial_period_days : seed.trialDays,
      interval: Number(livePlan.billing_period) === 365 ? "year" : Number(livePlan.billing_period) === 30 ? "month" : seed.interval,
    };
  });
}

let snapshot: { products: Product[]; at: number } | null = null;

export async function loadCatalogue(): Promise<Product[]> {
  if (snapshot && Date.now() - snapshot.at < FRESH_MS) return snapshot.products;
  try {
    const account = await loadAccountId();
    const [rawProducts, rawPlans] = await Promise.all([
      listAll<RawProduct>("products", account),
      listAll<RawPlan>("plans", account),
    ]);
    const products = buildStorefrontCatalog(rawProducts, rawPlans);
    snapshot = { products, at: Date.now() };
    return products;
  } catch {
    return snapshot?.products ?? seedProducts;
  }
}

export async function loadProduct(handle: string): Promise<Product | null> {
  const products = await loadCatalogue();
  return products.find((product) => product.handle === handle)
    ?? seedProducts.find((product) => product.handle === handle)
    ?? null;
}
