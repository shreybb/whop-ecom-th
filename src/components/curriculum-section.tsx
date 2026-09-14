const weeks = [
  { num: "1", title: "Weeks 01–02 · Foundation", desc: "Movement screening, baseline testing, and building the aerobic base." },
  { num: "2", title: "Weeks 03–04 · Volume Accumulation", desc: "Progressive overload ramps up. Nutrition targets locked in." },
  { num: "3", title: "Weeks 05–06 · Intensity Phase", desc: "Higher loads, reduced volume. Technique refinement under fatigue." },
  { num: "4", title: "Weeks 07–08 · Metabolic Conditioning", desc: "Cardio protocols layered in. Body composition shifts begin." },
  { num: "5", title: "Weeks 09–10 · Peak Phase", desc: "Personal records targeted. Sleep and recovery protocols optimised." },
  { num: "6", title: "Weeks 11–12 · Final Cut & Reveal", desc: "Refeed strategy, final photoshoot prep, and your next steps plan." },
];

export function CurriculumSection() {
  return (
    <section id="curriculum" className="ns-wrap py-12">
      <p className="ns-eyebrow mb-4">Week by week</p>
      <h2 className="text-[28px] font-bold md:text-[32px]">The 12-week roadmap</h2>
      <div className="mt-6 grid md:grid-cols-2 md:gap-x-10">
        {weeks.map((w) => (
          <div key={w.num} className="grid grid-cols-[44px_1fr] gap-3.5 border-t border-border py-[18px] last:border-b">
            <div className="ns-num mt-1">{w.num}</div>
            <div>
              <h3 className="mt-[5px] text-lg font-semibold">{w.title}</h3>
              <p className="mb-0 text-muted-foreground">{w.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
