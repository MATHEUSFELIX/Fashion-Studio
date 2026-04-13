import { aiApi } from "@/services/api/aiApi";
import type { ModelRegistryState } from "@/types/domain/models";

export function discoverWorkingModels(): Promise<ModelRegistryState> {
  return aiApi.listModels();
}
