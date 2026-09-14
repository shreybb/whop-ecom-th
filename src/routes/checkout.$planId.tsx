import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { ElementsCheckout } from "#/components/elements-checkout";
import { money } from "#/lib/money";
import { NORTHSTAR_RESOURCES } from "#/lib/resources";
import { loadStoreAccountId, loadStoreBrand, loadStoreCatalog } from "#/lib/server-fns";
import { getCheckoutEventId } from "#/lib/tracking";

export const Route = createFileRoute("/checkout/$planId")({
  loader: async () => ({
    products: await loadStoreCatalog(),
    brand: await loadStoreBrand(),
    accountId: await loadStoreAccountId(),
  }),
  component: CheckoutPage,
  head: ({ loaderData }) => ({ meta: [{ title: "Checkout | " + (loaderData?.brand.title ?? "") }] }),
});

function CheckoutPage() {
  const { planId } = Route.useParams();
  const { products, brand, accountId } = Route.useLoaderData();
  const product = products.find((entry) => entry.planId === planId);
  const isTrial = planId === NORTHSTAR_RESOURCES.plans.monthly;
  const [ready, setReady] = useState(false);
  const [origin, setOrigin] = useState("");
  const [eventId, setEventId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setReady(true);
    setOrigin(window.location.origin);
    // H3 FIX: do NOT fire add_to_cart here.
    // The pricing section click handler already fired add_to_cart and stored
    // the event_id in sessionStorage. We only retrieve it here for checkout
    // metadata so the server-side pixel can reuse the same (event_name, event_id).
    // If the user navigated directly (no stored ID), eventId remains undefined
    // and the checkout session carries no dedup metadata — no duplicate fire.
    const stored = getCheckoutEventId();
    if (stored) setEventId(stored);
  }, [planId]);

  const returnUrl = useMemo(() => (origin ? origin + "/order-complete" : undefined), [origin]);

  return (
    <div className="mx-auto min-h-screen max-w-[720px] px-6 py-12">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-sm font-bold">{brand.title}</Link>
        <Link to="/" className="text-sm text-muted-foreground underline underline-offset-4">Back to {brand.title}</Link>
      </div>
      <p className="ns-eyebrow mt-10">{isTrial ? "Free trial" : "Checkout"}</p>
      <h1 className="mt-3 text-3xl font-bold">{isTrial ? "Start your 7-day free trial" : "Complete your order"}</h1>
      <p className="mt-2 text-muted-foreground">
        {isTrial
          ? "Monthly Community. Card on file today. First charge is $49 after 7 days unless you cancel."
          : product
            ? product.title + " · " + money(product.price, product.currency)
            : "Complete your order"}
      </p>
      <div className="glass-card mt-8 p-4 sm:p-6">
        {ready && returnUrl ? (
          <ElementsCheckout
            planId={planId}
            accountId={accountId}
            returnUrl={returnUrl}
            eventId={eventId}
            submitLabel={isTrial ? "Start free trial" : "Pay now"}
          />
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">Loading checkout...</p>
        )}
      </div>
    </div>
  );
}
