import { useEffect, useState } from "react";
import { runDesignValidation } from "@/features/fashion-intelligence/services/intelligenceEngine";
import {
  intelligenceStorageKeys,
  readStoredAnalysis,
  writeStoredAnalysis,
} from "@/features/fashion-intelligence/services/intelligenceStorage";
import type {
  DesignValidationContext,
  DesignValidationResult,
} from "@/features/fashion-intelligence/types/intelligence";
import type { ModelOption } from "@/types/domain/models";

export function useDesignValidation(model: ModelOption | undefined, context: DesignValidationContext) {
  const storageKey = intelligenceStorageKeys.design(context.sku?.id ?? "no-sku");
  const [result, setResult] = useState<DesignValidationResult | undefined>(() =>
    readStoredAnalysis<DesignValidationResult>(storageKey),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    setResult(readStoredAnalysis<DesignValidationResult>(storageKey));
    setError(undefined);
  }, [storageKey]);

  const run = async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      const next = await runDesignValidation(model, context);
      setResult(next);
      writeStoredAnalysis(storageKey, next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Design Validation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return { result, isLoading, error, run };
}
