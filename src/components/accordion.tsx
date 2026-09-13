import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function Accordion({
  items,
}: {
  items: { title: string; body: ReactNode }[];
}) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.title} className="glass-card rounded-xl border px-6">
            <button
              type="button"
              className="flex w-full items-center justify-between py-4 text-left font-semibold"
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span>{item.title}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen ? <div className="pb-4 text-muted-foreground">{item.body}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
