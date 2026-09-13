const posts = [
  {
    slug: "how-progressive-overload-works",
    title: "Why Progressive Overload Is the Only Law in Training",
    excerpt: "Everything else is a variable. This is the constant.",
    date: "Aug 2026",
  },
  {
    slug: "protein-timing-myth",
    title: "The Protein Timing Myth — and What Actually Matters",
    excerpt: "It is not when you eat the protein. It is whether you hit the number.",
    date: "Jul 2026",
  },
  {
    slug: "sleep-and-body-composition",
    title: "How 7 Hours of Sleep Changed Our Clients\u2019 Body Composition",
    excerpt: "Recovery is training. We have the data to prove it.",
    date: "Jun 2026",
  },
];

export function BlogSection() {
  return (
    <section id="blog" className="section-padding">
      <div className="container mx-auto">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
          From the <span className="glow-text">Northstar Blog</span>
        </h2>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          {posts.map((p) => (
            <div key={p.slug} className="glass-card-hover p-6">
              <p className="mb-2 text-xs text-muted-foreground">{p.date}</p>
              <h3 className="mb-3 font-bold leading-snug">{p.title}</h3>
              <p className="text-sm text-muted-foreground italic">{p.excerpt}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
