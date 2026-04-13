import { createContext, useContext } from "react";
import type { CollectionPreset } from "@/types/domain/collectionPreset";

export interface StudioContextValue {
  collections: CollectionPreset[];
  activeCollection: CollectionPreset;
  activeCollectionId: string;
  addCollection: (collection: Omit<CollectionPreset, "id">) => void;
  setActiveCollectionId: (id: string) => void;
}

export const StudioContext = createContext<StudioContextValue | undefined>(undefined);

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error("useStudio must be used within StudioProvider");
  }
  return context;
}
