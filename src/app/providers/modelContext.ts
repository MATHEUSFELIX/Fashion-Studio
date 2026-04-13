import { createContext, useContext } from "react";
import type { ModelOption, ModelRegistryState } from "@/types/domain/models";

export interface ModelContextValue {
  registry?: ModelRegistryState;
  isLoading: boolean;
  selectedTextModel?: ModelOption;
  selectedImageModel?: ModelOption;
  selectTextModel: (modelId: string) => void;
  selectImageModel: (modelId: string) => void;
  refreshModels: () => Promise<void>;
}

export const ModelContext = createContext<ModelContextValue | undefined>(undefined);

export function useModels() {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModels must be used within ModelProvider");
  }
  return context;
}
