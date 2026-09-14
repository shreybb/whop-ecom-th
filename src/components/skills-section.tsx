const skills = [
  { title: "Structured Training", desc: "Periodised programming, not random workouts." },
  { title: "Precision Nutrition", desc: "Macro targets built around your body and goals." },
  { title: "Progress Tracking", desc: "Weekly check-in templates and metric dashboards." },
  { title: "Community", desc: "Private member community for accountability." },
  { title: "Video Library", desc: "200+ exercise demonstrations with coaching cues." },
  { title: "Ongoing Updates", desc: "Program evolves as science and results improve." },
];

export function SkillsSection() {
  return (
    <section id="skills" className="ns-wrap py-12">
      <p className="ns-eyebrow mb-4">What you get</p>
      <h2 className="mb-6 text-[28px] font-bold md:text-[32px]">
        Everything you need. Nothing you don&apos;t.
      </h2>
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((s) => (
          <div key={s.title} className="glass-card p-5">
            <h3 className="mb-1.5 text-lg font-semibold">{s.title}</h3>
            <p className="mb-0 text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
