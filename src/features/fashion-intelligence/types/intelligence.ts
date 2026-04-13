import type { CollectionBrief, CollectionPreset, ProductSku, StudioAsset } from "@/types/domain/collectionPreset";

export type PersonaSentiment = "positive" | "mixed" | "negative";
export type SuggestionPriority = "low" | "medium" | "high";
export type ChecklistStatus = "pass" | "warning" | "fail";
export type AnalysisSource = "ai" | "fallback";

export interface FashionPersona {
  id: string;
  name: string;
  role: string;
  perspective: string;
  systemPrompt: string;
  color: string;
  bgColor: string;
  sentimentBias: number;
}

export interface PersonaReaction {
  personaId: string;
  personaName: string;
  role: string;
  reactionSummary: string;
  sentiment: PersonaSentiment;
  mainPraise: string;
  mainConcern: string;
  recommendation: string;
}

export interface BenchmarkSnapshot {
  similarDirections: string[];
  saturatedElements: string[];
  whitespaceOpportunities: string[];
  differentiationIdeas: string[];
}

export interface BriefScore {
  trendAlignment: number;
  commercialPotential: number;
  brandFit: number;
  originality: number;
  clarity: number;
  productionFeasibility: number;
  overall: number;
}

export interface DesignScore {
  briefFit: number;
  commercialPotential: number;
  visualDistinctiveness: number;
  trendRelevance: number;
  productionReadiness: number;
  overall: number;
}

export interface BriefIntelligenceResult {
  generatedAt: string;
  source: AnalysisSource;
  executiveSummary: string;
  benchmarkSnapshot: BenchmarkSnapshot;
  personaReactions: PersonaReaction[];
  opportunities: string[];
  risks: string[];
  openQuestions: string[];
  briefScore: BriefScore;
  topNextActions: string[];
}

export interface RefinementSuggestion {
  title: string;
  reason: string;
  expectedImpact: string;
  priority: SuggestionPriority;
}

export interface DesignValidationResult {
  generatedAt: string;
  source: AnalysisSource;
  validationSummary: string;
  briefAdherenceSummary: string;
  alignedElements: string[];
  misalignedElements: string[];
  creativeStrengths: string[];
  commercialStrengths: string[];
  creativeRisks: string[];
  commercialRisks: string[];
  personaReactions: PersonaReaction[];
  refinementSuggestions: RefinementSuggestion[];
  designScore: DesignScore;
}

export interface TechnicalChecklistItem {
  label: string;
  status: ChecklistStatus;
  note: string;
}

export interface TechnicalValidationResult {
  generatedAt: string;
  source: AnalysisSource;
  validationSummary: string;
  missingFields: string[];
  inconsistencies: string[];
  productionRisks: string[];
  commercialConcerns: string[];
  brandConcerns: string[];
  checklist: TechnicalChecklistItem[];
  recommendedFixes: string[];
}

export interface BriefIntelligenceContext {
  collection: CollectionPreset;
  brief: CollectionBrief;
}

export interface DesignValidationContext {
  collection: CollectionPreset;
  brief: CollectionBrief;
  sku?: ProductSku;
  assets: StudioAsset[];
}

export interface TechnicalValidationContext {
  collection: CollectionPreset;
  brief: CollectionBrief;
  sku?: ProductSku;
  technicalNotes: Record<string, string>;
  technicalAssets: StudioAsset[];
}
