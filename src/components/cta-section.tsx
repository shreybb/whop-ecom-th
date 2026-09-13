export function CTASection() {
  return (
    <section className="section-padding">
      <div className="container relative mx-auto max-w-2xl text-center">
        <div className="bg-primary/10 animate-pulse-glow absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]" />
        <div className="relative z-10">
          <h2 className="mb-4 text-3xl font-extrabold md:text-5xl">
            Your Next 12 Weeks <span className="glow-text">Start Today</span>
          </h2>
          <p className="mb-8 text-muted-foreground">Join 2,400+ people who already took the first step.</p>
          {/* Checkout-link CTA — opens Whop hosted checkout page */}
          <a
            href="/#pricing"
            className="glow-button inline-block px-10 py-5 text-lg"
          >
            Start Your Transformation
          </a>
        </div>
      </div>
    </section>
  );
}
