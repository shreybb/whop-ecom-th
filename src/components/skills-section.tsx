const skills = [
  { icon: "⚡", title: "Structured Training", desc: "Periodised programming — not random workouts." },
  { icon: "🍽️", title: "Precision Nutrition", desc: "Macro targets built around your body and goals." },
  { icon: "📊", title: "Progress Tracking", desc: "Weekly check-in templates and metric dashboards." },
  { icon: "💬", title: "Community", desc: "Private member community for accountability." },
  { icon: "🎥", title: "Video Library", desc: "200+ exercise demonstrations with coaching cues." },
  { icon: "🔄", title: "Ongoing Updates", desc: "Program evolves as science and results improve." },
];

export function SkillsSection() {
  return (
    <section id="skills" className="section-padding">
      <div className="container mx-auto">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
          Everything You Need, <span className="glow-text">Nothing You Don&apos;t</span>
        </h2>
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((s) => (
            <div key={s.title} className="glass-card p-6">
              <div className="mb-3 text-3xl">{s.icon}</div>
              <h3 className="mb-2 font-bold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
