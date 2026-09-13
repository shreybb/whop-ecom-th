import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { ElementsCheckout } from "#/components/elements-checkout";
import { money } from "#/lib/money";
import { loadStoreAccountId, loadStoreBrand, loadStoreCatalog } from "#/lib/server-fns";
import { getCheckoutEventId, trackAddToCart } from "#/lib/tracking";

export const Route = createFileRoute("/checkout/$planId")({
  loader: async () => ({
    products: await loadStoreCatalog(),
    brand: await loadStoreBrand(),
    accountId: await loadStoreAccountId(),
  }),
  component: CheckoutPage,
  head: ({ loaderData }) => ({ meta: [{ title: `Checkout — ${loaderData?.brand.title ?? ""}` }] }),
});

function CheckoutPage() {
  const { planId } = Route.useParams();
  const { products, brand, accountId } = Route.useLoaderData();
  const product = products.find((entry) => entry.planId === planId);
  const [ready, setReady] = useState(false);
  const [origin, setOrigin] = useState("");
  const [eventId, setEventId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setReady(true);
    setOrigin(window.location.origin);
    // Fire add_to_cart and capture event_id for checkout metadata.
    const eid = trackAddToCart(planId, {
      value: product?.price,
      currency: product?.currency ?? "USD",
    });
    // Also check if a prior add_to_cart event_id is stored in session.
    const stored = getCheckoutEventId();
    setEventId(stored ?? eid);
  }, [planId, product]);

  const returnUrl = useMemo(() => (origin ? `${origin}/order-complete` : undefined), [origin]);

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-sm font-extrabold glow-text">{brand.title}</Link>
        <Link to="/" className="text-sm text-muted-foreground underline underline-offset-4">Back to {brand.title}</Link>
      </div>
      <h1 className="mt-10 text-3xl font-semibold">Checkout</h1>
      <p className="mt-2 text-muted-foreground">
        {product ? `${product.title} · ${money(product.price, product.currency)}` : "Complete your order"}
      </p>
      <div className="glass-card mt-8 rounded-2xl p-4 sm:p-6">
        {ready && returnUrl ? (
          <ElementsCheckout planId={planId} accountId={accountId} returnUrl={returnUrl} eventId={eventId} />
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">Loading checkout…</p>
        )}
      </div>
    </div>
  );
}
