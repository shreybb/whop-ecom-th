// Custom Cloudflare Worker entry for Northstar Method
// Intercepts POST /api/webhooks before delegating to TanStack Start SSR.

import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import { handleWebhookRequest } from "#/lib/webhook";
import type { WhopWebhookEnv } from "#/lib/webhook";

const ssrFetch = createStartHandler(defaultStreamHandler);

type CFEnv = WhopWebhookEnv & Record<string, unknown>;

export default {
  async fetch(request: Request, env: CFEnv): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/webhooks" && request.method === "POST") {
      return handleWebhookRequest(request, env);
    }
    return ssrFetch(request as unknown as Parameters<typeof ssrFetch>[0]);
  },
};
