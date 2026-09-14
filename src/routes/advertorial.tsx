import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { NORTHSTAR_RESOURCES } from "#/lib/resources";
import { trackAddToCart, trackLead, trackViewContent } from "#/lib/tracking";

export const Route = createFileRoute("/advertorial")({
  component: AdvertorialPage,
  head: () => ({
    meta: [{ title: "The 12-Week System That Actually Works | Northstar Method" }],
  }),
});

function AdvertorialPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const whop = (window as Window & { whop?: { setScope?: (id: string) => void } }).whop;
      whop?.setScope?.(NORTHSTAR_RESOURCES.businessId);
    }
    trackViewContent({ page: "advertorial" });
  }, []);

  function handleCta(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    trackAddToCart(NORTHSTAR_RESOURCES.plans.twelveWeek, { source: "advertorial_cta" });
    window.location.assign("/#pricing");
  }

  function handleLead(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    trackLead(email.trim(), { source: "advertorial" });
    setSubmitted(true);
  }

  return (
    <article className="mx-auto min-h-screen max-w-[720px] px-6 py-14 text-foreground">
      <Link to="/" className="mb-8 block text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
        Back to Northstar
      </Link>
      <p className="ns-eyebrow">Special report</p>
      <h1 className="mt-4 text-[clamp(28px,5vw,42px)] font-bold leading-[1.2]">
        The 12-week system that actually works, even if you have failed before
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">By the Northstar Method Team, September 2026</p>

      <p className="mt-8">
        <strong>94% of people who start a fitness program quit by week three.</strong> It is not willpower. It is that the program was built wrong.
      </p>
      <p className="mt-4">
        After 8 years coaching 2,400+ people, we identified exactly what separates the 6% who transform from the 94% who quit.
      </p>

      <div className="glass-card mt-8 border-l-4 border-primary p-6">
        <p className="font-semibold">Why most programs fail:</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Same intensity in week 1 as week 12.</li>
          <li>Nutrition ignored or impossibly complex.</li>
          <li>Zero accountability after purchase.</li>
        </ol>
      </div>

      <h2 className="mt-10 text-2xl font-semibold">What the Northstar Method Does Differently</h2>
      <p className="mt-3">
        Every 12-week block is periodised. Intensity, volume, and nutrition change in a coordinated way. Week 1 is not supposed to destroy you. Week 10 is.
      </p>
      <p className="mt-3">
        Nutrition is built around one simple macro target. Most people hit 80-90% compliance. That is enough.
      </p>

      <div className="mt-10 rounded-[14px] bg-primary px-6 py-10 text-center text-primary-foreground">
        <h2 className="text-2xl font-bold">Ready to Start?</h2>
        <p className="mt-2 text-sm">The 12-Week Program is open now. One-time payment. Lifetime access.</p>
        <a
          href="/#pricing"
          onClick={handleCta}
          className="ns-btn-on-primary mt-5"
        >
          See the Program
        </a>
      </div>

      <div className="glass-card mt-8 p-6">
        {submitted ? (
          <p className="py-4 text-center font-semibold">You&apos;re on the list.</p>
        ) : (
          <form onSubmit={handleLead}>
            <h3 className="text-lg font-semibold">Get the Free Northstar Starter Guide</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Leave your email for the week-1 training framework.
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="mt-4 w-full rounded-[8px] border border-input bg-background px-3.5 py-3 text-[15px] placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgba(250,70,22,.14)]"
            />
            <button type="submit" className="glow-button mt-3 w-full py-3 text-sm font-bold">
              Send Me the Free Guide
            </button>
          </form>
        )}
      </div>

      <p className="mt-16 pb-16 text-center text-[11px] text-muted-foreground">
        Advertorial for Northstar Method on Whop. Individual results may vary.
      </p>
    </article>
  );
}
