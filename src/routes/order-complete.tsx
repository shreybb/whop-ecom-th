import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { useBrand } from "#/lib/store";

export const Route = createFileRoute("/order-complete")({
  component: OrderComplete,
  head: () => ({ meta: [{ title: "Welcome | Northstar Method" }] }),
});

function OrderComplete() {
  const brand = useBrand();

  useEffect(() => {
    // Clear the checkout event_id from session after successful purchase.
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem("ns_checkout_event_id");
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="glass-card max-w-md p-10">
        <p className="ns-eyebrow mb-4">Welcome</p>
        <h1 className="mb-3 text-3xl font-bold">You&apos;re in</h1>
        <p className="mb-6 text-muted-foreground">
          Your {brand.title} membership is active. Check your email for access instructions. We cannot wait to see your results.
        </p>
        <div className="space-y-3">
          <a
            href="https://whop.com"
            className="glow-button block w-full py-3 text-center text-sm font-semibold"
          >
            Go to your dashboard
          </a>
          <Link
            to="/"
            className="block text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
          >
            Back to {brand.title}
          </Link>
        </div>
      </div>
    </div>
  );
}
