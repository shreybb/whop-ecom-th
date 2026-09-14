import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { AcademyHome } from "#/components/academy-home";
import { loadStoreCatalog } from "#/lib/server-fns";
import { trackViewContent } from "#/lib/tracking";

export const Route = createFileRoute("/")({
  loader: async () => ({ products: await loadStoreCatalog() }),
  component: Home,
  head: () => ({
    meta: [{ title: "Northstar Method | 12-Week Fitness Transformation" }],
  }),
});

function Home() {
  const { products } = Route.useLoaderData();

  useEffect(() => {
    // Fire view_content once per page load with a fresh event_id.
    trackViewContent({ page: "home" });
  }, []);

  return <AcademyHome products={products} />;
}
