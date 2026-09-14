import { Link } from "@tanstack/react-router";
import { hostedCheckoutUrl, NORTHSTAR_RESOURCES } from "#/lib/resources";
import { startHostedCheckout } from "#/lib/tracking";

interface HeroSectionProps {
  onOpenModal?: () => void;
}

const TRIAL_URL = hostedCheckoutUrl(NORTHSTAR_RESOURCES.checkout.monthly);

export function HeroSection({ onOpenModal }: HeroSectionProps) {
  return (
    <section className="ns-wrap pb-6 pt-16">
      <p className="ns-eyebrow mb-4">12-week fitness program</p>
      <h1 className="max-w-[18ch] text-[clamp(32px,5vw,52px)] font-bold">
        Build the body you were made for.
        <br />
        Then keep it.
      </h1>
      <p className="mt-4 max-w-[62ch] text-[19px] text-muted-foreground">
        One product: Northstar 12 Week Program. Buy it outright, start a 7-day free trial on the monthly community, or pay yearly.
      </p>
      <div className="mt-7 flex flex-wrap gap-2">
        <a
          href={TRIAL_URL}
          onClick={(e) => {
            e.preventDefault();
            startHostedCheckout(NORTHSTAR_RESOURCES.plans.monthly, TRIAL_URL, { source: "hero_trial" });
          }}
          className="glow-button px-5 py-2.5 text-[15px]"
        >
          Start 7-day free trial
        </a>
        <Link to="/" hash="pricing" className="ns-btn px-5 py-2.5 text-[15px]">
          See plans
        </Link>
        <button type="button" onClick={onOpenModal} className="ns-btn px-5 py-2.5 text-[15px]">
          Get the free guide
        </button>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        2,400+ transformations · 4.9 rating · CSCS-certified coaching
      </p>
    </section>
  );
}
