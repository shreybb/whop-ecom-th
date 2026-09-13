/**
 * Northstar Method — public Whop resource identifiers.
 *
 * Plan IDs, product IDs, and business IDs are NOT secrets: they are public
 * resource handles visible in any checkout link. They are safe to commit.
 * API keys, webhook secrets, and Upstash tokens are secrets and must stay
 * in environment variables / Worker secrets — never here.
 *
 * This file is the single source of truth for all Northstar Whop resources.
 * Import from here instead of hard-coding IDs elsewhere.
 */
export const NORTHSTAR_RESOURCES = {
  /** biz_MIbRyC2ejVkuzs */
  businessId: "biz_MIbRyC2ejVkuzs",

  /** app_wJzJqgIuWNnbPd — the hosted Whop app */
  appId: "app_wJzJqgIuWNnbPd",

  /** Canonical live URL for the hosted storefront */
  liveUrl: "https://northstar-method-fde.whop.site",

  /** prod_TR58zZsbQFwJu */
  productId: "prod_TR58zZsbQFwJu",

  plans: {
    /** $297 one-time (strike-through $397), 12-week program */
    twelveWeek: "plan_uCovSzsxHgwz2",

    /** $49/30 days with 7-day free trial */
    monthly: "plan_Svs8MVYQFVs5y",

    /** $399/365 days (~2 months free vs monthly) */
    yearly: "plan_gvAS7bFXjRnWk",

    /** Hidden founding-member plan (stock-limited) */
    foundingHidden: "plan_kPJlLjFJ88xC5",

    /** Cohort waitlist plan */
    cohortWaitlist: "plan_hciTbDQx7X208",

    /** Hidden test plan — do not surface in UI */
    hiddenTest: "plan_HJnyQHwV7mnGR",
  },

  promo: {
    id: "promo_9X6Rs6QzxDFI",
    /** 20% off promo code */
    code: "NORTHSTAR20",
  },
} as const;
