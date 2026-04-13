import { useEffect, useState } from "react";
import { runBriefIntelligence } from "@/features/fashion-intelligence/services/intelligenceEngine";
import {
  intelligenceStorageKeys,
  readStoredAnalysis,
  writeStoredAnalysis,
} from "@/features/fashion-intelligence/services/intelligenceStorage";
import type {
  BriefIntelligenceContext,
  BriefIntelligenceResult,
} from "@/features/fashion-intelligence/types/intelligence";
import type { ModelOption } from "@/types/domain/models";

export function useBriefIntelligence(model: ModelOption | undefined, context: BriefIntelligenceContext) {
  const storageKey = intelligenceStorageKeys.brief(context.collection.id);
  const [result, setResult] = useState<BriefIntelligenceResult | undefined>(() =>
    readStoredAnalysis<BriefIntelligenceResult>(storageKey),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    setResult(readStoredAnalysis<BriefIntelligenceResult>(storageKey));
    setError(undefined);
  }, [storageKey]);

  const run = async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      const next = await runBriefIntelligence(model, context);
      setResult(next);
      writeStoredAnalysis(storageKey, next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Fashion Intelligence failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return { result, isLoading, error, run };
}
