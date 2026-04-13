import type { AssetType } from "@/types/domain/studio";

export interface CreateDesignRequest {
  title: string;
  prompt: string;
  category: string;
  target_audience: string;
  collection_id?: string;
  reference_asset_ids: string[];
  input_type: "sketch" | "prompt" | "reference" | "asset";
}

export interface CreateDesignResponse {
  design_id: string;
  status: "processing";
  job_id: string;
}

export interface GenerateVariationsRequest {
  refinement_prompt?: string;
  count: number;
}

export interface GeneratePhotoshootRequest {
  scene: string;
  channel: "editorial" | "commerce" | "social";
}

export interface GenerateFlatRequest {
  include_measurements: boolean;
  format: "front" | "front_back";
}

export interface ScoreDesignResponse {
  design_id: string;
  creative: number;
  commercial: number;
  operational: number;
}

export interface CreateExportRequest {
  title: string;
  design_id: string;
  asset_ids: string[];
  include_types: AssetType[];
}
