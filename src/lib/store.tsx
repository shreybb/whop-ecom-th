import { createContext, useContext } from "react";

import { FALLBACK_BRAND, type Brand } from "#/lib/brand";

const BrandContext = createContext<Brand>(FALLBACK_BRAND);

export function BrandProvider({ brand, children }: { brand: Brand; children: React.ReactNode }) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export function useBrand(): Brand {
  return useContext(BrandContext);
}
