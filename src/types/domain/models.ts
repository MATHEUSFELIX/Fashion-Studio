export type ModelKind = "text" | "image";

export type ModelProvider = "openai" | "gemini" | "anthropic" | "ollama" | "stability";

export interface ModelOption {
  id: string;
  provider: ModelProvider;
  providerLabel: string;
  name: string;
  kind: ModelKind;
  status: "working";
  source: "provider_list" | "configured_model" | "validated_static";
}

export interface ModelRegistryState {
  textModels: ModelOption[];
  imageModels: ModelOption[];
  checkedAt: string;
  errors: string[];
}

export interface SelectedModels {
  textModelId?: string;
  imageModelId?: string;
}
