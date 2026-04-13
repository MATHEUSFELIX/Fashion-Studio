import { useMemo, useState, type ReactNode } from "react";
import { StudioContext } from "@/app/providers/studioContext";
import type { CollectionPreset, ProductSku, StudioAsset } from "@/types/domain/collectionPreset";

const storageKey = "studio-design-os:collections";
const activeStorageKey = "studio-design-os:active-collection";
const skuStorageKey = "studio-design-os:skus";
const activeSkuStorageKey = "studio-design-os:active-sku";
const assetStorageKey = "studio-design-os:studio-assets";

const defaultCollection: CollectionPreset = {
  id: "autumn-neutrals",
  name: "Autumn Neutrals",
  ageGroup: "3-6 years",
  theme: "Minimalist forest basics",
  season: "Core/Essentials",
  rules:
    "No bright colors, no large logos, no noisy prints, no adult styling. Focus on organic cotton, relaxed silhouettes, soft sage, ecru, warm grey, and natural cotton tones.",
  categories: ["t-shirt", "pajama", "socks"],
  palette: "soft sage, ecru, warm grey, natural cotton",
  materials: "organic cotton jersey, rib trims, breathable linen blends",
};

function readCollections(): CollectionPreset[] {
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as CollectionPreset[]) : [];
    return parsed.length ? parsed : [defaultCollection];
  } catch {
    return [defaultCollection];
  }
}

function readJsonArray<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function persistCollections(collections: CollectionPreset[], activeId: string) {
  window.localStorage.setItem(storageKey, JSON.stringify(collections));
  window.localStorage.setItem(activeStorageKey, activeId);
}

function persistSkus(skus: ProductSku[], activeSkuId?: string) {
  window.localStorage.setItem(skuStorageKey, JSON.stringify(skus));
  if (activeSkuId) {
    window.localStorage.setItem(activeSkuStorageKey, activeSkuId);
  }
}

function persistAssets(assets: StudioAsset[]) {
  window.localStorage.setItem(assetStorageKey, JSON.stringify(assets));
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<CollectionPreset[]>(() => readCollections());
  const [skus, setSkus] = useState<ProductSku[]>(() => readJsonArray<ProductSku>(skuStorageKey));
  const [assets, setAssets] = useState<StudioAsset[]>(() =>
    readJsonArray<StudioAsset>(assetStorageKey),
  );
  const [activeCollectionId, setActiveCollectionIdState] = useState(() => {
    try {
      return window.localStorage.getItem(activeStorageKey) ?? defaultCollection.id;
    } catch {
      return defaultCollection.id;
    }
  });
  const [activeSkuId, setActiveSkuIdState] = useState(() => {
    try {
      return window.localStorage.getItem(activeSkuStorageKey) ?? undefined;
    } catch {
      return undefined;
    }
  });

  const activeCollection =
    collections.find((collection) => collection.id === activeCollectionId) ?? collections[0] ?? defaultCollection;
  const activeSku =
    skus.find((sku) => sku.id === activeSkuId && sku.collectionId === activeCollection.id) ??
    skus.find((sku) => sku.collectionId === activeCollection.id);

  const value = useMemo(
    () => ({
      collections,
      activeCollection,
      activeCollectionId: activeCollection.id,
      skus,
      activeSku,
      activeSkuId: activeSku?.id,
      assets,
      addCollection: (collection: Omit<CollectionPreset, "id">) => {
        const id = `${collection.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
        const nextCollection = { ...collection, id };
        setCollections((current) => {
          const next = [...current, nextCollection];
          persistCollections(next, id);
          return next;
        });
        setActiveCollectionIdState(id);
      },
      updateCollectionBrief: (id: string, brief: CollectionPreset["brief"]) => {
        setCollections((current) => {
          const next = current.map((collection) =>
            collection.id === id ? { ...collection, brief } : collection,
          );
          persistCollections(next, activeCollection.id);
          return next;
        });
      },
      setActiveCollectionId: (id: string) => {
        setActiveCollectionIdState(id);
        persistCollections(collections, id);
      },
      addSku: (sku: Omit<ProductSku, "id" | "createdAt">) => {
        const nextSku: ProductSku = {
          ...sku,
          id: `sku_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        setSkus((current) => {
          const next = [nextSku, ...current];
          persistSkus(next, nextSku.id);
          return next;
        });
        setActiveSkuIdState(nextSku.id);
        const asset: StudioAsset = {
          id: `asset_${Date.now()}`,
          collectionId: sku.collectionId,
          skuId: nextSku.id,
          kind: "master_sku",
          title: nextSku.name,
          imageUrl: nextSku.imageUrl,
          payload: { prompt: nextSku.prompt, summary: nextSku.summary },
          createdAt: new Date().toISOString(),
        };
        setAssets((current) => {
          const next = [asset, ...current];
          persistAssets(next);
          return next;
        });
        return nextSku;
      },
      approveSku: (id: string) => {
        setSkus((current) => {
          const next = current.map((sku) =>
            sku.id === id ? { ...sku, status: "master_approved" as const } : sku,
          );
          persistSkus(next, id);
          return next;
        });
      },
      setActiveSkuId: (id: string) => {
        setActiveSkuIdState(id);
        persistSkus(skus, id);
      },
      addAsset: (asset: Omit<StudioAsset, "id" | "createdAt">) => {
        const nextAsset: StudioAsset = {
          ...asset,
          id: `studio_asset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date().toISOString(),
        };
        setAssets((current) => {
          const next = [nextAsset, ...current];
          persistAssets(next);
          return next;
        });
        return nextAsset;
      },
      getAssetsForSku: (skuId?: string) =>
        assets.filter((asset) => (skuId ? asset.skuId === skuId : asset.collectionId === activeCollection.id)),
    }),
    [activeCollection, activeSku, assets, collections, skus],
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}
