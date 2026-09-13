import { useBrand } from "#/lib/store";

export function FooterSection() {
  const brand = useBrand();
  return (
    <footer className="border-t border-border/50 px-4 py-12">
      <div className="container mx-auto grid gap-8 md:grid-cols-4">
        <div>
          <span className="glow-text text-lg font-bold">{brand.companyName}</span>
          <p className="mt-2 text-sm text-muted-foreground">
            The 12-week system for building a physique you are proud of.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/#about" className="transition-colors hover:text-primary">About</a></li>
            <li><a href="/#program" className="transition-colors hover:text-primary">Program</a></li>
            <li><a href="/#pricing" className="transition-colors hover:text-primary">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Resources</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/#testimonials" className="transition-colors hover:text-primary">Results</a></li>
            <li><a href="/#faq" className="transition-colors hover:text-primary">FAQ</a></li>
            <li><a href="/advertorial" className="transition-colors hover:text-primary">Free Guide</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Get Started</h4>
          <a href="/#pricing" className="glow-button inline-block px-5 py-2 text-sm">Join Now</a>
        </div>
      </div>
      <div className="container mx-auto mt-8 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
        © 2026 {brand.companyName}. Individual results may vary.
      </div>
    </footer>
  );
}
