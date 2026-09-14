const testimonials = [
  {
    text: "Down 22 lbs and my strength numbers are the best they have ever been. The structure is what made the difference.",
    name: "Marcus T.",
    tag: "Lost 22 lbs in 12 weeks",
  },
  {
    text: "I have tried every program out there. Northstar is the first one that actually explains the why behind every workout.",
    name: "Jess R.",
    tag: "Built 8 lbs of muscle",
  },
  {
    text: "The nutrition coaching alone was worth 10x the price. I finally understand how to eat for my goals.",
    name: "Daniel M.",
    tag: "12-Week Program graduate",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="ns-wrap py-12">
      <p className="ns-eyebrow mb-4">Results</p>
      <h2 className="mb-6 text-[28px] font-bold md:text-[32px]">Real people, real results</h2>
      <div className="grid gap-3.5 md:grid-cols-3">
        {testimonials.map((t) => (
          <div key={t.name} className="glass-card p-5">
            <p className="mb-4 text-[15px] font-medium">“{t.text}”</p>
            <p className="mb-0 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{t.name}</span>
              {" · "}
              {t.tag}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
