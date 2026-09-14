import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { PLAN_FEATURES } from "#/lib/catalog";
import { money } from "#/lib/money";
import { loadStoreProduct } from "#/lib/server-fns";
import { startCheckout } from "#/lib/tracking";
import { Navbar } from "#/components/navbar";
import { FooterSection } from "#/components/footer-section";

export const Route = createFileRoute("/products/$handle")({
  loader: async ({ params }) => {
    const product = await loadStoreProduct({ data: params.handle });
    if (!product) throw notFound();
    return product;
  },
  component: Page,
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.title ?? "Program"} | Northstar Method` }] }),
});

function Page() {
  const product = Route.useLoaderData();
  const features = PLAN_FEATURES[product.handle] ?? [];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="ns-wrap grid items-start gap-10 pt-10 pb-16 lg:grid-cols-2">
        <div>
          <p className="ns-eyebrow mb-3">Program</p>
          <h1 className="text-4xl font-bold">{product.title}</h1>
          <p className="mt-4 text-2xl font-bold text-[var(--orange-10)]">{money(product.price, product.currency)}</p>
          <p className="mt-6 text-muted-foreground">{product.description}</p>
          {product.planId ? (
            <Link
              to="/checkout/$planId"
              params={{ planId: product.planId }}
              onClick={(e) => {
                e.preventDefault();
                startCheckout(product.planId, { source: "product_page" });
              }}
              className="glow-button mt-8 inline-flex"
            >
              Get Started
            </Link>
          ) : (
            <p className="mt-8 text-sm">Checkout is not available.</p>
          )}
        </div>
        {features.length ? (
          <ul className="space-y-3 text-muted-foreground">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 border-b border-border py-2 last:border-0">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {f}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <FooterSection />
    </div>
  );
}
