const bullets = [
  "CSCS-certified strength & conditioning coach",
  "8+ years coaching competitive athletes",
  "2,400+ client transformations",
  "Former Division I strength coach",
  "Precision Nutrition Level 2 certified",
];

export function AboutSection() {
  return (
    <section id="about" className="ns-wrap py-12">
      <p className="ns-eyebrow mb-4">Your coach</p>
      <div className="grid items-start gap-10 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-[28px] font-bold md:text-[32px]">
            Built to coach at every level
          </h2>
          <p className="text-muted-foreground">
            The Northstar Method was built from a decade of coaching athletes and everyday people. Not theory. Repeatable systems that produce visible results in 12 weeks.
          </p>
        </div>
        <ul className="m-0 list-none space-y-0 p-0">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2.5 border-b border-border py-[7px] last:border-0">
              <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span className="text-[15px]">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
