import { Link } from "@tanstack/react-router";
import { useBrand } from "#/lib/store";

export function FooterSection() {
  const brand = useBrand();
  return (
    <footer className="mt-8 border-t border-border py-12 text-sm text-muted-foreground">
      <div className="ns-wrap grid gap-8 md:grid-cols-4">
        <div>
          <span className="text-[17px] font-bold text-foreground">{brand.companyName}</span>
          <p className="mt-2 text-sm">
            The 12-week system for building a physique you are proud of.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Quick links</h4>
          <ul className="space-y-2">
            <li><Link to="/" hash="about" className="hover:text-primary hover:underline">About</Link></li>
            <li><Link to="/" hash="program" className="hover:text-primary hover:underline">Program</Link></li>
            <li><Link to="/" hash="pricing" className="hover:text-primary hover:underline">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Resources</h4>
          <ul className="space-y-2">
            <li><Link to="/" hash="testimonials" className="hover:text-primary hover:underline">Results</Link></li>
            <li><Link to="/advertorial" className="hover:text-primary hover:underline">Free guide</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Get started</h4>
          <Link to="/" hash="pricing" className="glow-button">Join now</Link>
        </div>
      </div>
      <div className="ns-wrap mt-8 border-t border-border pt-8 text-center">
        © 2026 {brand.companyName}. Individual results may vary.
      </div>
    </footer>
  );
}
