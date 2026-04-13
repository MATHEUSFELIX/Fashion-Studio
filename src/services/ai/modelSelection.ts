import type { ModelOption, SelectedModels } from "@/types/domain/models";

const storageKey = "studio-design-os:selected-models";

export function readSelectedModels(): SelectedModels {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as SelectedModels) : {};
  } catch {
    return {};
  }
}

export function writeSelectedModels(selection: SelectedModels) {
  window.localStorage.setItem(storageKey, JSON.stringify(selection));
}

export function findModel(models: ModelOption[], id?: string): ModelOption | undefined {
  return models.find((model) => `${model.provider}:${model.id}` === id);
}

export function modelStorageId(model: ModelOption): string {
  return `${model.provider}:${model.id}`;
}
