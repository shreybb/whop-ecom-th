import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useBrand } from "#/lib/store";
import { hostedCheckoutUrl, NORTHSTAR_RESOURCES } from "#/lib/resources";
import { startHostedCheckout } from "#/lib/tracking";

const navLinks = ["About", "Program", "Pricing", "Testimonials"];
const TRIAL_URL = hostedCheckoutUrl(NORTHSTAR_RESOURCES.checkout.monthly);

export function Navbar() {
  const brand = useBrand();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border backdrop-blur-[10px] ${
        scrolled ? "bg-background/86" : "bg-background/86"
      }`}
    >
      <div className="ns-wrap flex h-[60px] items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-[17px] font-bold tracking-[-0.02em]">
          <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            NS
          </span>
          {brand.companyName}
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l}
              to="/"
              hash={l.toLowerCase()}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <a href="/advertorial" className="ns-btn">
            Free guide
          </a>
          <a
            href={TRIAL_URL}
            onClick={(e) => {
              e.preventDefault();
              startHostedCheckout(NORTHSTAR_RESOURCES.plans.monthly, TRIAL_URL, { source: "nav_trial" });
            }}
            className="glow-button"
          >
            Start free trial
          </a>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-foreground md:hidden"
          aria-label="Open menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {isOpen ? (
        <div className="border-t border-border px-6 py-4 md:hidden">
          {navLinks.map((l) => (
            <Link
              key={l}
              to="/"
              hash={l.toLowerCase()}
              onClick={() => setIsOpen(false)}
              className="block py-2 text-sm text-muted-foreground"
            >
              {l}
            </Link>
          ))}
          <a
            href="/advertorial"
            onClick={() => setIsOpen(false)}
            className="ns-btn mt-3 w-full"
          >
            Free guide
          </a>
          <a
            href={TRIAL_URL}
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              startHostedCheckout(NORTHSTAR_RESOURCES.plans.monthly, TRIAL_URL, { source: "nav_trial_mobile" });
            }}
            className="glow-button mt-3 w-full"
          >
            Start free trial
          </a>
        </div>
      ) : null}
    </header>
  );
}
