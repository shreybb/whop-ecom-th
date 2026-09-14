import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";

import { FALLBACK_BRAND } from "#/lib/brand";
import { loadStoreBrand } from "#/lib/server-fns";
import { BrandProvider } from "#/lib/store";
import appCss from "../styles.css?url";

const FONT = "https://rsms.me/inter/inter.css";

// Whop pixel: auto-loaded for biz_MIbRyC2ejVkuzs.
// On Whop-hosted pages (*.whop.site) the platform injects this automatically.
// Listed here explicitly for documentation and external pages that need manual inclusion.
const WHOP_PIXEL_SRC = "https://t.whop.tw/e/biz_MIbRyC2ejVkuzs.js";

export const Route = createRootRoute({
  loader: async () => ({ brand: await loadStoreBrand() }),
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: loaderData?.brand.title ?? FALLBACK_BRAND.title },
      {
        name: "description",
        content:
          "Transform your physique in 12 weeks with the Northstar Method: structured training, precision nutrition, and a private coaching community.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: FONT },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { brand } = Route.useLoaderData();
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <BrandProvider brand={brand}>{children}</BrandProvider>
        {/* Whop pixel — fires view_content via useEffect in index.tsx */}
        <script src={WHOP_PIXEL_SRC} async />
        <Scripts />
      </body>
    </html>
  );
}
