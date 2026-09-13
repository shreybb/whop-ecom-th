import { createServerFn } from "@tanstack/react-start";

import { loadAccountId, loadBrand } from "#/lib/brand.server";
import type { Brand } from "#/lib/brand";
import type { Product } from "#/lib/catalog";
import { loadCatalogue, loadProduct } from "#/lib/catalog.server";
import { whopPost } from "#/lib/whop.server";

export const loadStoreCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<Product[]> => loadCatalogue(),
);

export const loadStoreProduct = createServerFn({ method: "GET" })
  .validator((handle: string) => handle)
  .handler(async ({ data: handle }): Promise<Product | null> => loadProduct(handle));

export const loadStoreBrand = createServerFn({ method: "GET" }).handler(
  async (): Promise<Brand> => loadBrand(),
);

export const loadStoreAccountId = createServerFn({ method: "GET" }).handler(
  async (): Promise<string | undefined> => loadAccountId(),
);

export type CheckoutSessionResult = {
  id: string;
  client_secret: string;
  currency: string;
  amount: number;
  quoted_at?: string;
  seller_id?: string;
  payment_method_configuration?: {
    enabled?: string[];
    disabled?: string[];
    include_platform_defaults?: boolean;
  };
};

type RawCheckoutSession = {
  id?: string;
  client_secret?: string;
  payment_method_configuration?: {
    enabled?: string[];
    disabled?: string[];
    include_platform_defaults?: boolean;
  };
  quote?: {
    currency?: string;
    quoted_at?: string;
    breakdown?: { total?: { amount?: number | string } };
  };
  seller?: { id?: string };
  account?: { id?: string };
};

function asText(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asAmount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .validator((input: { planId: string; returnUrl: string; eventId?: string }) => input)
  .handler(async ({ data }): Promise<CheckoutSessionResult> => {
    const body: Record<string, unknown> = {
      items: [{ plan: data.planId, quantity: 1 }],
      return_url: data.returnUrl,
    };
    // Carry the browser event_id through checkout metadata so the
    // payment.succeeded webhook can retrieve and reuse it for server-side
    // pixel deduplication (see src/lib/webhook.ts).
    if (data.eventId) {
      body["metadata"] = { event_id: data.eventId };
    }
    const raw = await whopPost<RawCheckoutSession>("/checkout_sessions", body);
    const id = asText(raw.id);
    const clientSecret = asText(raw.client_secret);
    if (!id || !clientSecret) throw new Error("Checkout session was missing credentials.");
    const major = asAmount(raw.quote?.breakdown?.total?.amount);
    return {
      id,
      client_secret: clientSecret,
      currency: asText(raw.quote?.currency) ?? "usd",
      amount: Math.round(major * 100),
      quoted_at: asText(raw.quote?.quoted_at),
      seller_id: asText(raw.seller?.id) ?? asText(raw.account?.id),
      payment_method_configuration: raw.payment_method_configuration,
    };
  });

export type ConfirmCheckoutResult = {
  last_confirm_error?: { message?: string } | null;
  next_action?: {
    type?: string;
    client_secret?: string;
    destination_url?: string;
  } | null;
};

export const confirmCheckoutSession = createServerFn({ method: "POST" })
  .validator((input: {
    sessionId: string;
    clientSecret: string;
    confirmationToken: string;
    quotedAt?: string;
  }) => input)
  .handler(async ({ data }): Promise<ConfirmCheckoutResult> => {
    return await whopPost<ConfirmCheckoutResult>(`/checkout_sessions/${data.sessionId}/confirm`, {
      client_secret: data.clientSecret,
      confirmation_token: data.confirmationToken,
      attestations: { tos_accepted: true },
      expected_quoted_at: data.quotedAt,
    });
  });
