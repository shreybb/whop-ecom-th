export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  collection: string;
  planId: string;
  planType: string;
  trialDays?: number;
  interval?: "month" | "year";
};

export const COLLECTIONS = [
  { slug: "programs", name: "Programs", blurb: "Structured 12-week fitness transformation." },
] as const;

export const PLAN_FEATURES: Record<string, string[]> = {
  "northstar-12wk": [
    "Full 12-week training program",
    "Nutrition & macro coaching",
    "Video library (200+ workouts)",
    "Private community access",
    "Weekly check-in templates",
    "Lifetime access to materials",
  ],
  "northstar-monthly": [
    "Everything in 12-Week Program",
    "Weekly live Q&A with coach",
    "Direct coach messaging",
    "New content every month",
    "7-day free trial",
  ],
  "northstar-yearly": [
    "Everything in Monthly",
    "1-on-1 strategy session (1hr)",
    "Priority coach support",
    "Exclusive annual member events",
    "Best value: 2 months free",
  ],
};
