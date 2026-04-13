export function readStoredAnalysis<T>(key: string): T | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export function writeStoredAnalysis<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const intelligenceStorageKeys = {
  brief: (collectionId: string) => `studio-design-os:fashion-intelligence:brief:${collectionId}`,
  design: (skuId: string) => `studio-design-os:fashion-intelligence:design:${skuId}`,
  technical: (skuId: string) => `studio-design-os:fashion-intelligence:technical:${skuId}`,
};
