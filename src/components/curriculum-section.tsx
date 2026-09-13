const weeks = [
  { num: "01–02", title: "Foundation", desc: "Movement screening, baseline testing, and building the aerobic base." },
  { num: "03–04", title: "Volume Accumulation", desc: "Progressive overload ramps up. Nutrition targets locked in." },
  { num: "05–06", title: "Intensity Phase", desc: "Higher loads, reduced volume. Technique refinement under fatigue." },
  { num: "07–08", title: "Metabolic Conditioning", desc: "Cardio protocols layered in. Body composition shifts begin." },
  { num: "09–10", title: "Peak Phase", desc: "Personal records targeted. Sleep and recovery protocols optimised." },
  { num: "11–12", title: "Final Cut & Reveal", desc: "Refeed strategy, final photoshoot prep, and your next steps plan." },
];

export function CurriculumSection() {
  return (
    <section id="curriculum" className="section-padding">
      <div className="container mx-auto max-w-3xl">
        <p className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-primary">Week by Week</p>
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
          12-Week <span className="glow-text">Roadmap</span>
        </h2>
        <div className="space-y-4">
          {weeks.map((w) => (
            <div key={w.num} className="glass-card flex gap-4 p-4">
              <span className="w-16 shrink-0 text-xs font-bold text-primary pt-1">WEEK {w.num}</span>
              <div>
                <h3 className="font-bold">{w.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
