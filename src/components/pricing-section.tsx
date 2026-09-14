import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Product } from "#/lib/catalog";
import { PLAN_FEATURES } from "#/lib/catalog";
import { money } from "#/lib/money";
import { seedProducts } from "#/lib/seed";
import { startCheckout } from "#/lib/tracking";

function pick(products: Product[], handle: string) {
  return products.find((p) => p.handle === handle)
    ?? seedProducts.find((p) => p.handle === handle);
}

const PLAN_CONFIGS = [
  {
    handle: "northstar-12wk",
    label: "12-Week Program",
    badge: null,
    popular: false,
    strikeThrough: "$397",
    note: "One-time · $297 · lifetime access",
    cta: "Get started",
  },
  {
    handle: "northstar-monthly",
    label: "Monthly Community",
    badge: "7-day free trial",
    popular: true,
    strikeThrough: null,
    note: "Free for 7 days, then $49 / month. Cancel anytime.",
    cta: "Start free trial",
  },
  {
    handle: "northstar-yearly",
    label: "Annual Membership",
    badge: "Best value",
    popular: false,
    strikeThrough: null,
    note: "$399 / year. About 2 months free vs monthly.",
    cta: "Get started",
  },
] as const;

function priceLabel(product: Product | undefined, interval?: Product["interval"]) {
  if (!product) return "";
  const base = money(product.price, product.currency);
  if (interval === "month" || product.interval === "month") return `${base} / mo`;
  if (interval === "year" || product.interval === "year") return `${base} / yr`;
  return base;
}

export function PricingSection({ products }: { products: Product[] }) {
  const cards = PLAN_CONFIGS.map((cfg) => {
    const product = pick(products, cfg.handle);
    return {
      ...cfg,
      name: cfg.label,
      price: priceLabel(product),
      features: PLAN_FEATURES[cfg.handle] ?? [],
      planId: product?.planId ?? "",
    };
  });

  return (
    <section id="pricing" className="bg-secondary">
      <div className="ns-wrap py-14">
        <p className="ns-eyebrow mb-4">Pricing</p>
        <h2 className="mb-2 text-[28px] font-bold md:text-[32px]">Plans for one product</h2>
        <p className="mb-8 text-muted-foreground">
          Northstar 12 Week Program. $297 one-time, $49 monthly with a 7-day trial, or $399 yearly.
        </p>
        <div className="grid gap-3.5 md:grid-cols-3">
          {cards.map((p) => (
            <div
              key={p.handle}
              className={`glass-card relative flex flex-col p-5 ${p.popular ? "border-primary" : ""}`}
            >
              {p.badge ? (
                <span className="mb-3 inline-flex self-start rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                  {p.badge}
                </span>
              ) : null}
              <h3 className="mb-1.5 text-lg font-semibold">{p.name}</h3>
              <div className="mb-1 flex items-baseline gap-2">
                <p className="text-[28px] font-bold text-primary">{p.price}</p>
                {p.strikeThrough ? (
                  <span className="text-sm text-muted-foreground line-through">{p.strikeThrough}</span>
                ) : null}
              </div>
              <p className="mb-5 text-xs text-muted-foreground">{p.note}</p>
              <ul className="mb-6 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 shrink-0 text-primary" size={16} />
                    {f}
                  </li>
                ))}
              </ul>
              {p.planId ? (
                <Link
                  to="/checkout/$planId"
                  params={{ planId: p.planId }}
                  onClick={(e) => {
                    e.preventDefault();
                    startCheckout(p.planId, { source: "pricing_section" });
                  }}
                  className={p.popular ? "glow-button w-full py-2.5" : "ns-btn w-full py-2.5"}
                >
                  {p.cta}
                </Link>
              ) : (
                <span className="ns-btn w-full py-2.5 opacity-50">Unavailable</span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Founding-member seats are stock-limited and hidden from this page. Live cohort uses the waitlist above.
        </p>
      </div>
    </section>
  );
}
