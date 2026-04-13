import { useEffect, useState } from "react";
import { runTechnicalValidation } from "@/features/fashion-intelligence/services/intelligenceEngine";
import {
  intelligenceStorageKeys,
  readStoredAnalysis,
  writeStoredAnalysis,
} from "@/features/fashion-intelligence/services/intelligenceStorage";
import type {
  TechnicalValidationContext,
  TechnicalValidationResult,
} from "@/features/fashion-intelligence/types/intelligence";
import type { ModelOption } from "@/types/domain/models";

export function useTechnicalValidation(model: ModelOption | undefined, context: TechnicalValidationContext) {
  const storageKey = intelligenceStorageKeys.technical(context.sku?.id ?? "no-sku");
  const [result, setResult] = useState<TechnicalValidationResult | undefined>(() =>
    readStoredAnalysis<TechnicalValidationResult>(storageKey),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    setResult(readStoredAnalysis<TechnicalValidationResult>(storageKey));
    setError(undefined);
  }, [storageKey]);

  const run = async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      const next = await runTechnicalValidation(model, context);
      setResult(next);
      writeStoredAnalysis(storageKey, next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Technical Validation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return { result, isLoading, error, run };
}
