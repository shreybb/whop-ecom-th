import { useState } from "react";
import { X } from "lucide-react";
import { trackLead } from "#/lib/tracking";

export function LeadCaptureModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    trackLead(email.trim(), { source: "lead_modal" });
    setSubmitted(true);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-card relative z-10 w-full max-w-md rounded-2xl border-primary/30 p-8">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-muted-foreground transition-colors hover:text-foreground">
          <X size={20} />
        </button>
        {submitted ? (
          <div className="py-8 text-center">
            <p className="mb-2 text-2xl font-bold">You&apos;re in! 🔥</p>
            <p className="text-muted-foreground">Check your inbox — your free training guide is on its way.</p>
          </div>
        ) : (
          <>
            <h3 className="mb-2 text-2xl font-bold">
              Free <span className="glow-text">Northstar Starter Guide</span>
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              The exact training framework our top 100 transformers used in week 1. No fluff.
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
              />
              <button type="submit" className="glow-button w-full py-4 text-lg">
                Send Me the Free Guide
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-muted-foreground">No spam. Unsubscribe anytime.</p>
          </>
        )}
      </div>
    </div>
  );
}
