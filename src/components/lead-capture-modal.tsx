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
      <div className="glass-card relative z-10 w-full max-w-md p-7">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-muted-foreground transition-colors hover:text-foreground">
          <X size={20} />
        </button>
        {submitted ? (
          <div className="py-8 text-center">
            <p className="mb-2 text-2xl font-bold">You&apos;re on the list</p>
            <p className="text-muted-foreground">Thanks. We have your email for the week-1 starter guide.</p>
          </div>
        ) : (
          <>
            <h3 className="mb-2 text-2xl font-bold">Free Northstar starter guide</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              The week-1 training framework our top transformers used. Leave your email to join the list.
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-[8px] border border-input bg-background px-3.5 py-3 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgba(250,70,22,.14)]"
              />
              <button type="submit" className="glow-button w-full py-4 text-lg">
                Send Me the Free Guide
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-muted-foreground">No spam.</p>
          </>
        )}
      </div>
    </div>
  );
}
