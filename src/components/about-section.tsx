import { CheckCircle } from "lucide-react";

const bullets = [
  "CSCS-certified strength & conditioning coach",
  "8+ years coaching competitive athletes",
  "2,400+ client transformations",
  "Former Division I strength coach",
  "Precision Nutrition Level 2 certified",
];

export function AboutSection() {
  return (
    <section id="about" className="section-padding gradient-bg">
      <div className="container mx-auto">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="glass-card rounded-2xl p-2">
            <img src="/instructor.jpg" alt="Northstar Method coach" className="aspect-[4/5] w-full rounded-xl object-cover" />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Your Coach</p>
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              Built to <span className="glow-text">Coach at Every Level</span>
            </h2>
            <p className="mb-6 text-muted-foreground">
              The Northstar Method was built from a decade of coaching athletes and everyday people. Not theory — repeatable systems that produce visible results in 12 weeks.
            </p>
            <ul className="space-y-4">
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-3 text-lg text-muted-foreground">
                  <CheckCircle className="shrink-0 text-primary" size={22} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
