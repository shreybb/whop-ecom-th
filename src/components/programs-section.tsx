import { ArrowRight } from "lucide-react";
import type { Product } from "#/lib/catalog";
import { money } from "#/lib/money";

export function ProgramsSection({ products }: { products: Product[] }) {
  return (
    <section id="program" className="section-padding">
      <div className="container mx-auto">
        <p className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-primary">What You Get</p>
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
          The <span className="glow-text">Complete System</span>
        </h2>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="glass-card-hover flex flex-col p-6">
              <div className="mb-3 text-3xl">
                {product.planType === "one_time" ? "🏋️" : product.price < 100 ? "📅" : "🏆"}
              </div>
              <h3 className="mb-2 text-lg font-bold">{product.title}</h3>
              <p className="mb-4 flex-1 text-sm text-muted-foreground">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="glow-text font-bold">{money(product.price, product.currency)}</span>
                <a href={`/checkout/${product.planId}`} className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  Get Started <ArrowRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
