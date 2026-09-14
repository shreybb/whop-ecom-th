import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { NORTHSTAR_RESOURCES } from "#/lib/resources";
import { startHostedCheckout } from "#/lib/tracking";

const WAITLIST_URL = `https://whop.com/checkout/${NORTHSTAR_RESOURCES.plans.cohortWaitlist}`;

export function ProgramsSection() {
  return (
    <section id="program" className="ns-wrap py-12">
      <p className="ns-eyebrow mb-4">The product</p>
      <h2 className="mb-6 text-[28px] font-bold md:text-[32px]">Northstar 12 Week Program</h2>
      <div className="grid gap-3.5 md:grid-cols-2">
        <div className="glass-card flex flex-col p-5">
          <h3 className="mb-1.5 text-lg font-semibold">One product. Course, chat, and forum.</h3>
          <p className="mb-4 flex-1 text-sm text-muted-foreground">
            Structured 12-week training, precision nutrition, a video course, private chat, and a member forum. Buy once or subscribe. Same access either way.
          </p>
          <Link to="/" hash="pricing" className="relative z-10 flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            See plans <ArrowRight size={14} />
          </Link>
        </div>
        <div className="glass-card flex flex-col p-5">
          <h3 className="mb-1.5 text-lg font-semibold">Live cohort waitlist</h3>
          <p className="mb-4 flex-1 text-sm text-muted-foreground">
            Next coach-led cohort. Join the waitlist and we will email you when seats open. Founding-member pricing stays off this page.
          </p>
          <button
            type="button"
            onClick={() => startHostedCheckout(NORTHSTAR_RESOURCES.plans.cohortWaitlist, WAITLIST_URL, { source: "waitlist" })}
            className="relative z-10 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Join waitlist <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
