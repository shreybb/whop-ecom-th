interface HeroSectionProps {
  onOpenModal?: () => void;
}

export function HeroSection({ onOpenModal }: HeroSectionProps) {
  return (
    <section className="section-padding relative flex min-h-screen items-center justify-center overflow-hidden pt-32">
      <div className="absolute inset-0">
        <img src="/hero-bg.jpg" alt="" className="h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>
      <div className="bg-primary/10 animate-pulse-glow absolute top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[120px]" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">12-Week Transformation Program</p>
        <h1 className="mb-6 text-4xl leading-tight font-extrabold md:text-6xl">
          Build the Body You Were Made For —{" "}
          <span className="glow-text">No Guesswork Required</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          The Northstar Method is a proven 12-week system built for people who are serious about changing their physique, not just going through the motions.
        </p>
        <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
          <a href="/#pricing" className="glow-button px-8 py-4 text-lg">Start Your Transformation</a>
          <button
            type="button"
            onClick={onOpenModal}
            className="rounded-lg border border-primary/30 px-8 py-4 font-semibold text-foreground transition-all duration-300 hover:bg-primary/10"
          >
            Get Free Training Guide
          </button>
        </div>
        <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
          <span>⚡ 2,400+ transformations</span>
          <span>⭐ 4.9 average rating</span>
          <span>🏆 Certified Strength Coach</span>
        </div>
      </div>
    </section>
  );
}
