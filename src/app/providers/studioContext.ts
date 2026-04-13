import { createContext, useContext } from "react";
import type { CollectionPreset, ProductSku, StudioAsset } from "@/types/domain/collectionPreset";

export interface StudioContextValue {
  collections: CollectionPreset[];
  activeCollection: CollectionPreset;
  activeCollectionId: string;
  skus: ProductSku[];
  activeSku?: ProductSku;
  activeSkuId?: string;
  assets: StudioAsset[];
  addCollection: (collection: Omit<CollectionPreset, "id">) => CollectionPreset;
  updateCollectionBrief: (id: string, brief: CollectionPreset["brief"]) => void;
  setActiveCollectionId: (id: string) => void;
  addSku: (sku: Omit<ProductSku, "id" | "createdAt">) => ProductSku;
  approveSku: (id: string) => void;
  setActiveSkuId: (id: string) => void;
  addAsset: (asset: Omit<StudioAsset, "id" | "createdAt">) => StudioAsset;
  getAssetsForSku: (skuId?: string) => StudioAsset[];
}

export const StudioContext = createContext<StudioContextValue | undefined>(undefined);

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error("useStudio must be used within StudioProvider");
  }
  return context;
}
