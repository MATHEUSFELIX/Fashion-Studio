import { useMemo, useState, type ReactNode } from "react";
import { StudioContext } from "@/app/providers/studioContext";
import type { CollectionPreset } from "@/types/domain/collectionPreset";

const storageKey = "studio-design-os:collections";
const activeStorageKey = "studio-design-os:active-collection";

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

function persist(collections: CollectionPreset[], activeId: string) {
  window.localStorage.setItem(storageKey, JSON.stringify(collections));
  window.localStorage.setItem(activeStorageKey, activeId);
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<CollectionPreset[]>(() => readCollections());
  const [activeCollectionId, setActiveCollectionIdState] = useState(() => {
    try {
      return window.localStorage.getItem(activeStorageKey) ?? defaultCollection.id;
    } catch {
      return defaultCollection.id;
    }
  });

  const activeCollection =
    collections.find((collection) => collection.id === activeCollectionId) ?? collections[0] ?? defaultCollection;

  const value = useMemo(
    () => ({
      collections,
      activeCollection,
      activeCollectionId: activeCollection.id,
      addCollection: (collection: Omit<CollectionPreset, "id">) => {
        const id = `${collection.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
        const nextCollection = { ...collection, id };
        setCollections((current) => {
          const next = [...current, nextCollection];
          persist(next, id);
          return next;
        });
        setActiveCollectionIdState(id);
      },
      setActiveCollectionId: (id: string) => {
        setActiveCollectionIdState(id);
        persist(collections, id);
      },
    }),
    [activeCollection, collections],
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}
