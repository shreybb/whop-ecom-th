import { Star, User } from "lucide-react";

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
    <section id="testimonials" className="section-padding gradient-bg">
      <div className="container mx-auto">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
          Real People, <span className="glow-text">Real Results</span>
        </h2>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card-hover p-6">
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="fill-primary text-primary" size={16} />
                ))}
              </div>
              <p className="mb-4 text-muted-foreground italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <User className="text-muted-foreground" size={18} />
                </div>
                <div>
                  <span className="block text-sm font-semibold">{t.name}</span>
                  <span className="block text-xs text-primary">{t.tag}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
