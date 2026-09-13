import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { PLAN_FEATURES } from "#/lib/catalog";
import { money } from "#/lib/money";
import { loadStoreProduct } from "#/lib/server-fns";
import { Navbar } from "#/components/navbar";
import { FooterSection } from "#/components/footer-section";

export const Route = createFileRoute("/products/$handle")({
  loader: async ({ params }) => {
    const product = await loadStoreProduct({ data: params.handle });
    if (!product) throw notFound();
    return product;
  },
  component: Page,
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.title ?? "Program"} — Zero Day` }] }),
});

function Page() {
  const product = Route.useLoaderData();
  const features = PLAN_FEATURES[product.handle] ?? [];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto grid gap-10 px-6 pt-32 pb-16 md:grid-cols-2">
        <img src={product.image || "/hero-bg.jpg"} alt={product.title} className="w-full rounded-2xl object-cover" />
        <div>
          <h1 className="text-4xl font-bold">{product.title}</h1>
          <p className="glow-text mt-4 text-2xl font-extrabold">{money(product.price, product.currency)}</p>
          <p className="mt-6 max-w-md text-muted-foreground">{product.description}</p>
          {features.length ? (
            <ul className="mt-6 space-y-2 text-muted-foreground">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {f}
                </li>
              ))}
            </ul>
          ) : null}
          {product.planId ? (
            <Link
              to="/checkout/$planId"
              params={{ planId: product.planId }}
              className="glow-button mt-8 inline-flex"
            >
              Get Started
            </Link>
          ) : (
            <p className="mt-8 text-sm">Checkout is not available.</p>
          )}
        </div>
      </div>
      <FooterSection />
    </div>
  );
}
