function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

function apiKey() {
  return readEnv("WHOP_API_KEY");
}

function apiOrigin() {
  return readEnv("WHOP_API_ORIGIN") ?? "https://api.whop.com";
}

export function companyId() {
  return readEnv("WHOP_COMPANY_ID");
}

type Page<T> = {
  data?: T[];
  page_info?: { has_next_page?: boolean; end_cursor?: string | null };
};

async function whopRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const key = apiKey();
  if (key) headers.Authorization = `Bearer ${key}`;
  const response = await fetch(`${apiOrigin()}/api/v1${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? `Whop turned the request down (${response.status}).`);
  }
  return payload as T;
}

export async function whopGet<T>(path: string): Promise<T> {
  return whopRequest<T>("GET", path);
}

export async function whopPost<T>(path: string, body: unknown): Promise<T> {
  return whopRequest<T>("POST", path, body);
}

export async function listAll<T>(resource: string, accountId?: string): Promise<T[]> {
  const account = accountId || companyId();
  const rows: T[] = [];
  let after: string | null = null;
  for (let page = 0; page < 8; page++) {
    const query = new URLSearchParams({ first: "100" });
    if (account) query.set("account_id", account);
    if (after) query.set("after", after);
    const body: Page<T> = await whopGet(`/${resource}?${query}`);
    rows.push(...(body.data ?? []));
    if (!body.page_info?.has_next_page || !body.page_info.end_cursor) break;
    after = body.page_info.end_cursor;
  }
  return rows;
}
