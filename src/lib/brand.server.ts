import { FALLBACK_BRAND, type Brand } from "#/lib/brand";
import { companyId, whopGet } from "#/lib/whop.server";

const FRESH_MS = 60_000;
type RawAccount = { id?: unknown; title?: unknown };
let snapshot: { brand: Brand; accountId: string | undefined; at: number } | null = null;

function asText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function fetchAccount(): Promise<RawAccount> {
  const id = companyId();
  if (id) return await whopGet<RawAccount>(`/accounts/${id}`);
  return await whopGet<RawAccount>("/accounts/me");
}

export async function loadBrand(): Promise<Brand> {
  if (snapshot && Date.now() - snapshot.at < FRESH_MS) return snapshot.brand;
  try {
    const row = await fetchAccount();
    const title = asText(row.title) ?? FALLBACK_BRAND.title;
    const brand = { title, companyName: title };
    snapshot = { brand, accountId: asText(row.id) ?? companyId(), at: Date.now() };
    return brand;
  } catch {
    return snapshot?.brand ?? FALLBACK_BRAND;
  }
}

export async function loadAccountId(): Promise<string | undefined> {
  if (snapshot && Date.now() - snapshot.at < FRESH_MS) return snapshot.accountId ?? companyId();
  await loadBrand();
  return snapshot?.accountId ?? companyId();
}
