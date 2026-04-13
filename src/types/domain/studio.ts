export type SourceKind = "human_input" | "ai_generation" | "system_recommendation";

export type DesignStatus = "draft" | "processing" | "ready" | "approved";
export type JobStatus = "queued" | "processing" | "complete" | "failed";
export type AssetType = "concept" | "variation" | "photoshoot" | "technical_flat" | "export";

export interface Design {
  id: string;
  title: string;
  prompt: string;
  category: string;
  targetAudience: string;
  collectionId?: string;
  status: DesignStatus;
  source: SourceKind;
  heroImage: string;
  createdAt: string;
  updatedAt: string;
  attributes: Record<string, string>;
  versionHistory: DesignVersion[];
}

export interface DesignVersion {
  id: string;
  label: string;
  note: string;
  source: SourceKind;
  createdAt: string;
}

export interface DesignVariation {
  id: string;
  designId: string;
  title: string;
  image: string;
  palette: string;
  silhouette: string;
  score: number;
  status: "generated" | "favorite" | "approved";
  source: SourceKind;
}

export interface Collection {
  id: string;
  title: string;
  season: string;
  designIds: string[];
  kpis: {
    concepts: number;
    approved: number;
    exportReady: number;
  };
}

export interface Asset {
  id: string;
  designId?: string;
  title: string;
  type: AssetType;
  source: SourceKind;
  image: string;
  createdAt: string;
}

export interface GenerationJob {
  id: string;
  label: string;
  status: JobStatus;
  progress: number;
  source: SourceKind;
  relatedDesignId?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  detail: string;
  priority: "low" | "medium" | "high";
  source: "system_recommendation";
}

export interface DesignScore {
  designId: string;
  creative: number;
  commercial: number;
  operational: number;
  recommendations: Recommendation[];
}

export interface ExportBundle {
  id: string;
  title: string;
  assetIds: string[];
  status: JobStatus;
  createdAt: string;
}
