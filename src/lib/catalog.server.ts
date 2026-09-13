import type { Product } from "#/lib/catalog";
import { seedProducts } from "#/lib/seed";
import { loadAccountId } from "#/lib/brand.server";
import { listAll } from "#/lib/whop.server";

const FRESH_MS = 60_000;
const JUNK = new Set([
  "default title", "storefront", "lookbook",
  "taste", "cafe", "cpg", "press", "surf", "jewelry", "beauty",
  "sip", "brew", "batch", "folio", "swell", "facet", "lumen",
  "trading", "gold-tape", "coffee", "academy",
]);

type RawPlan = {
  id?: unknown;
  title?: unknown;
  initial_price?: unknown;
  renewal_price?: unknown;
  currency?: unknown;
  visibility?: unknown;
  plan_type?: unknown;
  product?: { id?: unknown } | string | null;
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

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function productIdOf(plan: RawPlan): string {
  if (typeof plan.product === "string") return plan.product;
  if (plan.product && typeof plan.product.id === "string") return plan.product.id;
  return "";
}

function mapProduct(row: RawProduct, plans: RawPlan[]): Product | null {
  if (row.visibility && row.visibility !== "visible") return null;
  const title = typeof row.title === "string" ? row.title.trim() : "";
  if (!title || JUNK.has(title.toLowerCase())) return null;
  const routeHandle = (typeof row.route === "string" && row.route) || slugify(title);
  const productPlans = plans.filter((plan) => productIdOf(plan) === String(row.id) && (!plan.visibility || plan.visibility === "visible"));
  if (row.default_plan && typeof row.default_plan.id === "string") {
    if (!productPlans.some((plan) => plan.id === row.default_plan?.id)) productPlans.unshift(row.default_plan);
  }
  const plan = productPlans[0];
  if (!plan || typeof plan.id !== "string") return null;
  const seed = seedProducts.find((item) => item.title.toLowerCase() === title.toLowerCase() || item.handle === routeHandle);
  const handle = seed?.handle || routeHandle;
  const labels = Array.isArray(row.labels) ? row.labels.filter((label): label is string => typeof label === "string") : [];
  return {
    id: String(row.id ?? handle),
    handle,
    title,
    description: (typeof row.description === "string" && row.description.trim()) || seed?.description || title,
    price: moneyAmount(plan.renewal_price) || moneyAmount(plan.initial_price),
    currency: moneyCurrency(plan.initial_price, moneyCurrency(plan.currency)),
    image: seed?.image || "/hero-bg.jpg",
    collection: (labels[0] || seed?.collection || "programs").toLowerCase(),
    planId: String(plan.id),
    planType: typeof plan.plan_type === "string" ? plan.plan_type : seed?.planType || "one_time",
  };
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
    const products = rawProducts.map((row) => mapProduct(row, rawPlans)).filter((row): row is Product => Boolean(row));
    if (products.length === 0) return seedProducts;
    snapshot = { products, at: Date.now() };
    return products;
  } catch {
    return snapshot?.products ?? seedProducts;
  }
}

export async function loadProduct(handle: string): Promise<Product | null> {
  const products = await loadCatalogue();
  return products.find((product) => product.handle === handle) ?? null;
}
