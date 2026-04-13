import { fashionPersonas } from "@/features/fashion-intelligence/personas/fashionPersonas";
import type {
  BenchmarkSnapshot,
  BriefIntelligenceResult,
  BriefScore,
  DesignScore,
  DesignValidationResult,
  PersonaReaction,
  PersonaSentiment,
  SuggestionPriority,
  ChecklistStatus,
  TechnicalValidationResult,
} from "@/features/fashion-intelligence/types/intelligence";

const sentiments: PersonaSentiment[] = ["positive", "mixed", "negative"];

export function parseJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const jsonText = fenced.match(/\{[\s\S]*\}/)?.[0] ?? fenced;
  return JSON.parse(jsonText);
}

export function toStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const next = value.map((item) => String(item ?? "").trim()).filter(Boolean);
  return next.length ? next : fallback;
}

export function toScore(value: unknown, fallback = 70): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function normalizeSentiment(value: unknown, fallback: PersonaSentiment): PersonaSentiment {
  return sentiments.includes(value as PersonaSentiment) ? (value as PersonaSentiment) : fallback;
}

function normalizePriority(value: unknown): SuggestionPriority {
  return value === "low" || value === "medium" || value === "high" ? value : "medium";
}

function normalizeChecklistStatus(value: unknown): ChecklistStatus {
  return value === "pass" || value === "warning" || value === "fail" ? value : "warning";
}

export function normalizePersonaReactions(value: unknown, focus: string): PersonaReaction[] {
  const rows = Array.isArray(value) ? value : [];
  return fashionPersonas.map((persona, index) => {
    const row = asRecord(rows.find((item) => asRecord(item).personaId === persona.id) ?? rows[index]);
    const fallbackSentiment: PersonaSentiment =
      persona.sentimentBias > 0.2 ? "positive" : persona.sentimentBias < -0.2 ? "negative" : "mixed";
    return {
      personaId: persona.id,
      personaName: String(row.personaName ?? persona.name),
      role: String(row.role ?? persona.role),
      reactionSummary: String(
        row.reactionSummary ??
          `${persona.name} reviewed ${focus} through ${persona.perspective.toLowerCase()}.`,
      ),
      sentiment: normalizeSentiment(row.sentiment, fallbackSentiment),
      mainPraise: String(row.mainPraise ?? "The direction has a clear customer-facing intent."),
      mainConcern: String(row.mainConcern ?? "Some assumptions need proof before production."),
      recommendation: String(row.recommendation ?? "Tighten the brief and validate the riskiest claim."),
    };
  });
}

export function normalizeBriefResult(value: unknown): BriefIntelligenceResult {
  const raw = asRecord(value);
  const benchmark = asRecord(raw.benchmarkSnapshot);
  const score = asRecord(raw.briefScore);
  const result: BriefIntelligenceResult = {
    generatedAt: new Date().toISOString(),
    source: raw.source === "fallback" ? "fallback" : "ai",
    executiveSummary: String(
      raw.executiveSummary ??
        "The collection has a clear fashion direction, with strongest upside if the assortment keeps a disciplined point of view.",
    ),
    benchmarkSnapshot: {
      similarDirections: toStringArray(benchmark.similarDirections, [
        "Soft everyday essentials positioned around comfort and gentle color.",
      ]),
      saturatedElements: toStringArray(benchmark.saturatedElements, [
        "Neutral basics can feel generic without a distinct styling or material story.",
      ]),
      whitespaceOpportunities: toStringArray(benchmark.whitespaceOpportunities, [
        "Use trims, proportion, and photography to create a recognizable studio language.",
      ]),
      differentiationIdeas: toStringArray(benchmark.differentiationIdeas, [
        "Define one memorable construction detail per category.",
      ]),
    },
    personaReactions: normalizePersonaReactions(raw.personaReactions, "the collection brief"),
    opportunities: toStringArray(raw.opportunities, [
      "Build a concise capsule around the clearest category and palette rule.",
    ]),
    risks: toStringArray(raw.risks, ["The concept may become too safe without a distinctive SKU signature."]),
    openQuestions: toStringArray(raw.openQuestions, ["What price tier and retail channel will anchor the launch?"]),
    briefScore: {
      trendAlignment: toScore(score.trendAlignment),
      commercialPotential: toScore(score.commercialPotential),
      brandFit: toScore(score.brandFit),
      originality: toScore(score.originality, 62),
      clarity: toScore(score.clarity),
      productionFeasibility: toScore(score.productionFeasibility),
      overall: toScore(score.overall),
    },
    topNextActions: toStringArray(raw.topNextActions, [
      "Lock the hero SKU before generating wider variations.",
      "Clarify material and fit claims in the technical notes.",
    ]),
  };
  return result;
}

export function normalizeDesignResult(value: unknown): DesignValidationResult {
  const raw = asRecord(value);
  const score = asRecord(raw.designScore);
  return {
    generatedAt: new Date().toISOString(),
    source: raw.source === "fallback" ? "fallback" : "ai",
    validationSummary: String(
      raw.validationSummary ?? "The SKU is reviewable, but needs clearer proof against the brief before handoff.",
    ),
    briefAdherenceSummary: String(
      raw.briefAdherenceSummary ?? "The design broadly follows the collection intent with a few details to tighten.",
    ),
    alignedElements: toStringArray(raw.alignedElements, ["Palette and category direction align with the brief."]),
    misalignedElements: toStringArray(raw.misalignedElements, ["Some styling or construction details need checking."]),
    creativeStrengths: toStringArray(raw.creativeStrengths, ["The SKU has a clear visual starting point."]),
    commercialStrengths: toStringArray(raw.commercialStrengths, ["The category is easy to understand for retail."]),
    creativeRisks: toStringArray(raw.creativeRisks, ["The design may need a stronger signature detail."]),
    commercialRisks: toStringArray(raw.commercialRisks, ["Price/value perception depends on material quality."]),
    personaReactions: normalizePersonaReactions(raw.personaReactions, "the design"),
    refinementSuggestions: (Array.isArray(raw.refinementSuggestions) ? raw.refinementSuggestions : [])
      .map((item) => asRecord(item))
      .map((item) => ({
        title: String(item.title ?? "Refine design detail"),
        reason: String(item.reason ?? "This improves fit to the brief."),
        expectedImpact: String(item.expectedImpact ?? "Higher commercial and creative clarity."),
        priority: normalizePriority(item.priority),
      }))
      .slice(0, 6),
    designScore: {
      briefFit: toScore(score.briefFit),
      commercialPotential: toScore(score.commercialPotential),
      visualDistinctiveness: toScore(score.visualDistinctiveness, 65),
      trendRelevance: toScore(score.trendRelevance),
      productionReadiness: toScore(score.productionReadiness, 62),
      overall: toScore(score.overall),
    },
  };
}

export function normalizeTechnicalResult(value: unknown): TechnicalValidationResult {
  const raw = asRecord(value);
  return {
    generatedAt: new Date().toISOString(),
    source: raw.source === "fallback" ? "fallback" : "ai",
    validationSummary: String(
      raw.validationSummary ?? "The technical package needs a few practical fields before production review.",
    ),
    missingFields: toStringArray(raw.missingFields, ["Measurements", "Care instructions", "Material composition"]),
    inconsistencies: toStringArray(raw.inconsistencies, ["No severe inconsistencies detected from available fields."]),
    productionRisks: toStringArray(raw.productionRisks, ["Construction tolerances should be confirmed before sampling."]),
    commercialConcerns: toStringArray(raw.commercialConcerns, ["Customer value depends on material and finish clarity."]),
    brandConcerns: toStringArray(raw.brandConcerns, ["Ensure styling remains age-appropriate and brand-consistent."]),
    checklist: (Array.isArray(raw.checklist) ? raw.checklist : [])
      .map((item) => asRecord(item))
      .map((item) => ({
        label: String(item.label ?? "Technical checkpoint"),
        status: normalizeChecklistStatus(item.status),
        note: String(item.note ?? "Review before production handoff."),
      }))
      .slice(0, 8),
    recommendedFixes: toStringArray(raw.recommendedFixes, [
      "Complete missing measurements and construction notes.",
      "Confirm fabric composition, trims, and care labels.",
    ]),
  };
}

export function fallbackBriefResult(): BriefIntelligenceResult {
  return normalizeBriefResult({ source: "fallback" });
}

export function emptyBenchmark(): BenchmarkSnapshot {
  return {
    similarDirections: [],
    saturatedElements: [],
    whitespaceOpportunities: [],
    differentiationIdeas: [],
  };
}

export function averageBriefScore(score: BriefScore) {
  return Math.round(
    (score.trendAlignment +
      score.commercialPotential +
      score.brandFit +
      score.originality +
      score.clarity +
      score.productionFeasibility) /
      6,
  );
}

export function averageDesignScore(score: DesignScore) {
  return Math.round(
    (score.briefFit +
      score.commercialPotential +
      score.visualDistinctiveness +
      score.trendRelevance +
      score.productionReadiness) /
      5,
  );
}
