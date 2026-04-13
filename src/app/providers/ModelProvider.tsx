import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ModelContext, type ModelContextValue } from "@/app/providers/modelContext";
import { discoverWorkingModels } from "@/services/ai/modelRegistry";
import {
  findModel,
  modelStorageId,
  readSelectedModels,
  writeSelectedModels,
} from "@/services/ai/modelSelection";
import type { ModelRegistryState, SelectedModels } from "@/types/domain/models";

export function ModelProvider({ children }: { children: ReactNode }) {
  const [registry, setRegistry] = useState<ModelRegistryState>();
  const [selection, setSelection] = useState<SelectedModels>(() => readSelectedModels());
  const [isLoading, setIsLoading] = useState(true);

  const refreshModels = async () => {
    setIsLoading(true);
    const nextRegistry = await discoverWorkingModels();
    setRegistry(nextRegistry);
    setSelection((current) => {
      const selectedText =
        findModel(nextRegistry.textModels, current.textModelId) ?? nextRegistry.textModels[0];
      const selectedImage =
        findModel(nextRegistry.imageModels, current.imageModelId) ?? nextRegistry.imageModels[0];
      const nextSelection = {
        textModelId: selectedText ? modelStorageId(selectedText) : undefined,
        imageModelId: selectedImage ? modelStorageId(selectedImage) : undefined,
      };
      writeSelectedModels(nextSelection);
      return nextSelection;
    });
    setIsLoading(false);
  };

  useEffect(() => {
    void refreshModels();
  }, []);

  const value = useMemo<ModelContextValue>(
    () => ({
      registry,
      isLoading,
      selectedTextModel: findModel(registry?.textModels ?? [], selection.textModelId),
      selectedImageModel: findModel(registry?.imageModels ?? [], selection.imageModelId),
      selectTextModel: (modelId) => {
        setSelection((current) => {
          const next = { ...current, textModelId: modelId };
          writeSelectedModels(next);
          return next;
        });
      },
      selectImageModel: (modelId) => {
        setSelection((current) => {
          const next = { ...current, imageModelId: modelId };
          writeSelectedModels(next);
          return next;
        });
      },
      refreshModels,
    }),
    [isLoading, registry, selection],
  );

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
}
