import { hostedCheckoutUrl, NORTHSTAR_RESOURCES } from "#/lib/resources";
import { startHostedCheckout } from "#/lib/tracking";

const TRIAL_URL = hostedCheckoutUrl(NORTHSTAR_RESOURCES.checkout.monthly);

export function CTASection() {
  return (
    <section className="ns-wrap py-14">
      <div className="glass-card bg-secondary p-8 text-center">
        <p className="ns-eyebrow mb-4">Get started</p>
        <h2 className="mb-3 text-[28px] font-bold md:text-[32px]">
          Your next 12 weeks start today
        </h2>
        <p className="mb-6 text-muted-foreground">7-day free trial on the monthly community. Card required, charged after the trial.</p>
        <a
          href={TRIAL_URL}
          onClick={(e) => {
            e.preventDefault();
            startHostedCheckout(NORTHSTAR_RESOURCES.plans.monthly, TRIAL_URL, { source: "cta_trial" });
          }}
          className="glow-button px-6 py-2.5 text-[15px]"
        >
          Start 7-day free trial
        </a>
      </div>
    </section>
  );
}
