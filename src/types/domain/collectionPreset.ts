export interface CollectionPreset {
  id: string;
  name: string;
  ageGroup: string;
  theme: string;
  season: string;
  rules: string;
  categories: string[];
  palette: string;
  materials: string;
  brief?: CollectionBrief;
}

export interface CollectionBrief {
  concept: string;
  keyDesignPrinciples: string[];
  categories: Array<{
    name: string;
    details: string;
  }>;
  rulesApplied: string;
}

export interface ProductSku {
  id: string;
  collectionId: string;
  name: string;
  category: string;
  prompt: string;
  imageUrl: string;
  summary?: string;
  status: "draft" | "master_approved";
  createdAt: string;
}

export type StudioAssetKind =
  | "master_sku"
  | "photoshoot"
  | "technical_flat"
  | "score_summary"
  | "export";

export interface StudioAsset {
  id: string;
  collectionId: string;
  skuId?: string;
  kind: StudioAssetKind;
  title: string;
  imageUrl?: string;
  payload?: unknown;
  createdAt: string;
}
