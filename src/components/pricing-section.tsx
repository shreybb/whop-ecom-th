import { Check } from "lucide-react";
import type { Product } from "#/lib/catalog";
import { PLAN_FEATURES } from "#/lib/catalog";
import { money } from "#/lib/money";
import { trackAddToCart } from "#/lib/tracking";

function pick(products: Product[], handle: string) {
  return products.find((p) => p.handle === handle);
}

const PLAN_CONFIGS = [
  {
    handle: "northstar-12wk",
    label: "12-Week Program",
    badge: null,
    popular: false,
    strikeThrough: "$397",
    note: "One-time payment · Lifetime access",
  },
  {
    handle: "northstar-monthly",
    label: "Monthly",
    badge: "Most Popular",
    popular: true,
    strikeThrough: null,
    note: "7-day free trial · Cancel anytime",
  },
  {
    handle: "northstar-yearly",
    label: "Annual",
    badge: "Best Value",
    popular: false,
    strikeThrough: null,
    note: "2 months free · Locked-in rate",
  },
] as const;

export function PricingSection({ products }: { products: Product[] }) {
  const cards = PLAN_CONFIGS.map((cfg) => {
    const product = pick(products, cfg.handle);
    return {
      ...cfg,
      name: product?.title ?? cfg.label,
      price: product ? money(product.price, product.currency) : "",
      features: PLAN_FEATURES[cfg.handle] ?? [],
      planId: product?.planId ?? "",
      href: product?.planId ? `/checkout/${product.planId}` : "/#pricing",
    };
  });

  return (
    <section id="pricing" className="section-padding gradient-bg">
      <div className="container mx-auto">
        <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
          Choose Your <span className="glow-text">Plan</span>
        </h2>
        <p className="mb-12 text-center text-muted-foreground">
          One product. Multiple ways in. All roads lead to the same result.
        </p>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {cards.map((p) => (
            <div
              key={p.handle}
              className={`glass-card-hover relative flex flex-col p-8 ${p.popular ? "border-primary/50 ring-1 ring-primary/30" : ""}`}
            >
              {p.badge ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                  {p.badge}
                </span>
              ) : null}
              <h3 className="mb-2 text-xl font-bold">{p.name}</h3>
              <div className="mb-1 flex items-baseline gap-2">
                <p className="glow-text text-3xl font-extrabold">{p.price}</p>
                {p.strikeThrough ? (
                  <span className="text-muted-foreground line-through text-sm">{p.strikeThrough}</span>
                ) : null}
              </div>
              <p className="mb-6 text-xs text-muted-foreground">{p.note}</p>
              <ul className="mb-8 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="shrink-0 text-primary" size={18} />
                    {f}
                  </li>
                ))}
              </ul>
              {/* Embedded checkout link on pricing section CTA */}
              <a
                href={p.href}
                onClick={() => {
                  if (p.planId) {
                    trackAddToCart(p.planId, { value: undefined, source: "pricing_section" });
                  }
                }}
                className={`rounded-lg py-3 text-center font-semibold transition-all duration-300 ${
                  p.popular ? "glow-button" : "border border-primary/30 text-foreground hover:bg-primary/10"
                }`}
              >
                {p.handle === "northstar-monthly" ? "Start Free Trial" : "Get Started"}
              </a>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          All plans include the Northstar Method community. Secure checkout powered by Whop.
        </p>
      </div>
    </section>
  );
}
