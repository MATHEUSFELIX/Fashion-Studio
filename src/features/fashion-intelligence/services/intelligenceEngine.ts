import { summarizePersonas } from "@/features/fashion-intelligence/personas/fashionPersonas";
import {
  normalizeBriefResult,
  normalizeDesignResult,
  normalizeTechnicalResult,
  parseJsonObject,
} from "@/features/fashion-intelligence/services/intelligenceSchemas";
import type {
  BriefIntelligenceContext,
  BriefIntelligenceResult,
  DesignValidationContext,
  DesignValidationResult,
  TechnicalValidationContext,
  TechnicalValidationResult,
} from "@/features/fashion-intelligence/types/intelligence";
import { aiApi } from "@/services/api/aiApi";
import type { ModelOption } from "@/types/domain/models";

const jsonInstructions = [
  "You are Fashion Intelligence inside Fashion Studio.",
  "Use the persona lenses provided, but do not mention internal orchestration.",
  "Return strict JSON only. No markdown, no prose outside JSON.",
  "All scores are integers from 0 to 100.",
  "Keep every array to 3-6 useful items.",
].join("\n");

function stringifyBrief(context: BriefIntelligenceContext) {
  const { collection, brief } = context;
  return [
    `Collection: ${collection.name}`,
    `Age group: ${collection.ageGroup}`,
    `Season: ${collection.season}`,
    `Theme: ${collection.theme}`,
    `Palette: ${collection.palette}`,
    `Materials: ${collection.materials}`,
    `Categories: ${collection.categories.join(", ")}`,
    `Rules: ${collection.rules}`,
    `Brief concept: ${brief.concept}`,
    `Key principles: ${brief.keyDesignPrinciples.join(" | ")}`,
    `Brief categories: ${brief.categories.map((category) => `${category.name}: ${category.details}`).join(" | ")}`,
    `Rules applied: ${brief.rulesApplied}`,
  ].join("\n");
}

function parseOrThrow<T>(text: string, normalize: (value: unknown) => T): T {
  if (!text.trim()) {
    throw new Error("The model returned an empty analysis.");
  }
  try {
    return normalize(parseJsonObject(text));
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `The model returned malformed JSON: ${error.message}`
        : "The model returned malformed JSON.",
    );
  }
}

function fallbackBrief(context: BriefIntelligenceContext): BriefIntelligenceResult {
  return normalizeBriefResult({
    source: "fallback",
    executiveSummary: `${context.collection.name} has enough structure for an initial read, but the model response could not be parsed. Use this as a conservative checkpoint before rerunning.`,
    benchmarkSnapshot: {
      similarDirections: [
        `${context.collection.palette} essentials with ${context.collection.materials} cues.`,
        `Age-specific ${context.collection.categories.join(", ")} capsules for ${context.collection.season}.`,
      ],
      saturatedElements: ["Neutral kidswear basics can look interchangeable without a signature detail."],
      whitespaceOpportunities: ["Create a repeatable detail system across trims, fit, and photoshoot language."],
      differentiationIdeas: ["Choose one hero construction or styling rule that every SKU can echo."],
    },
    opportunities: ["Use the edited brief as a strong guardrail for SKU generation."],
    risks: ["The collection may underperform if the visual identity stays too generic."],
    openQuestions: ["Which SKU should become the master look for the rest of the collection?"],
    briefScore: {
      trendAlignment: 70,
      commercialPotential: 72,
      brandFit: 76,
      originality: 62,
      clarity: 74,
      productionFeasibility: 78,
      overall: 72,
    },
    topNextActions: ["Run intelligence again with a stricter model if needed.", "Generate one master SKU and validate it."],
  });
}

function fallbackDesign(context: DesignValidationContext): DesignValidationResult {
  return normalizeDesignResult({
    source: "fallback",
    validationSummary: `${context.sku?.name ?? "The active SKU"} can be reviewed, but the model response could not be parsed.`,
    briefAdherenceSummary: "The SKU should be checked manually against palette, material, age group, and category rules.",
    alignedElements: ["Category and collection context are available for validation."],
    misalignedElements: ["Visual details need confirmation against the edited brief."],
    refinementSuggestions: [
      {
        title: "Tighten brief-visible details",
        reason: "The design needs clear proof of palette, material, and age-appropriate styling.",
        expectedImpact: "Improves review confidence before photoshoot and export.",
        priority: "high",
      },
    ],
    designScore: {
      briefFit: 68,
      commercialPotential: 70,
      visualDistinctiveness: 62,
      trendRelevance: 68,
      productionReadiness: 58,
      overall: 65,
    },
  });
}

function fallbackTechnical(context: TechnicalValidationContext): TechnicalValidationResult {
  const missingFields = Object.entries(context.technicalNotes)
    .filter(([, value]) => !value.trim())
    .map(([label]) => label);
  return normalizeTechnicalResult({
    source: "fallback",
    validationSummary: `${context.sku?.name ?? "The active SKU"} needs a conservative technical review because the model response could not be parsed.`,
    missingFields: missingFields.length ? missingFields : ["Measurements", "Care instructions", "Material composition"],
    inconsistencies: ["No model-readable inconsistencies were available from the malformed response."],
    productionRisks: ["Sampling risk remains until required fields are complete."],
    commercialConcerns: ["Customer value depends on material, fit, and care clarity."],
    brandConcerns: ["Confirm the technical choices preserve the collection rules."],
    checklist: [
      { label: "Core fields", status: missingFields.length ? "warning" : "pass", note: "Review all manual fields." },
      { label: "Production handoff", status: "warning", note: "Rerun validation after completing technical notes." },
    ],
    recommendedFixes: ["Complete blank technical fields.", "Rerun Technical Validation with the selected text model."],
  });
}

export async function runBriefIntelligence(
  model: ModelOption | undefined,
  context: BriefIntelligenceContext,
): Promise<BriefIntelligenceResult> {
  if (!model) throw new Error("Choose a working text model before running Fashion Intelligence.");
  if (!context.brief.concept.trim()) throw new Error("Add a collection brief before running Fashion Intelligence.");

  const result = await aiApi.generateText({
    model,
    instructions: jsonInstructions,
    prompt: [
      "Analyze this fashion collection brief.",
      "",
      "Persona lenses adapted from the SwarmMind-Studio fashion intelligence setup:",
      summarizePersonas(),
      "",
      "Context:",
      stringifyBrief(context),
      "",
      "Return JSON with shape:",
      `{
  "executiveSummary": "string",
  "benchmarkSnapshot": {
    "similarDirections": ["string"],
    "saturatedElements": ["string"],
    "whitespaceOpportunities": ["string"],
    "differentiationIdeas": ["string"]
  },
  "personaReactions": [{
    "personaId": "commercial_buyer | trend_aware_shopper | conservative_shopper | brand_lead | visual_merchandiser | production_risk_reviewer",
    "personaName": "string",
    "role": "string",
    "reactionSummary": "string",
    "sentiment": "positive | mixed | negative",
    "mainPraise": "string",
    "mainConcern": "string",
    "recommendation": "string"
  }],
  "opportunities": ["string"],
  "risks": ["string"],
  "openQuestions": ["string"],
  "briefScore": {
    "trendAlignment": 0,
    "commercialPotential": 0,
    "brandFit": 0,
    "originality": 0,
    "clarity": 0,
    "productionFeasibility": 0,
    "overall": 0
  },
  "topNextActions": ["string"]
}`,
    ].join("\n"),
  });

  try {
    return parseOrThrow(result.text, normalizeBriefResult);
  } catch {
    return fallbackBrief(context);
  }
}

export async function runDesignValidation(
  model: ModelOption | undefined,
  context: DesignValidationContext,
): Promise<DesignValidationResult> {
  if (!model) throw new Error("Choose a working text model before validating the design.");
  if (!context.sku) throw new Error("Generate or select a SKU before validating a design.");

  const photoshootAssets = context.assets.filter((asset) => asset.kind === "photoshoot");
  const result = await aiApi.generateText({
    model,
    instructions: jsonInstructions,
    prompt: [
      "Validate this fashion SKU against the active collection brief.",
      "",
      "Persona lenses adapted from the SwarmMind-Studio fashion intelligence setup:",
      summarizePersonas(),
      "",
      "Brief context:",
      stringifyBrief({ collection: context.collection, brief: context.brief }),
      "",
      "Design context:",
      `SKU: ${context.sku.name}`,
      `Category: ${context.sku.category}`,
      `Prompt: ${context.sku.prompt}`,
      `Summary: ${context.sku.summary ?? "No summary"}`,
      `Status: ${context.sku.status}`,
      `Saved photoshoot assets: ${photoshootAssets.length}`,
      "",
      "Return JSON with shape:",
      `{
  "validationSummary": "string",
  "briefAdherenceSummary": "string",
  "alignedElements": ["string"],
  "misalignedElements": ["string"],
  "creativeStrengths": ["string"],
  "commercialStrengths": ["string"],
  "creativeRisks": ["string"],
  "commercialRisks": ["string"],
  "personaReactions": [{
    "personaId": "commercial_buyer | trend_aware_shopper | conservative_shopper | brand_lead | visual_merchandiser | production_risk_reviewer",
    "personaName": "string",
    "role": "string",
    "reactionSummary": "string",
    "sentiment": "positive | mixed | negative",
    "mainPraise": "string",
    "mainConcern": "string",
    "recommendation": "string"
  }],
  "refinementSuggestions": [{
    "title": "string",
    "reason": "string",
    "expectedImpact": "string",
    "priority": "low | medium | high"
  }],
  "designScore": {
    "briefFit": 0,
    "commercialPotential": 0,
    "visualDistinctiveness": 0,
    "trendRelevance": 0,
    "productionReadiness": 0,
    "overall": 0
  }
}`,
    ].join("\n"),
  });

  try {
    return parseOrThrow(result.text, normalizeDesignResult);
  } catch {
    return fallbackDesign(context);
  }
}

export async function runTechnicalValidation(
  model: ModelOption | undefined,
  context: TechnicalValidationContext,
): Promise<TechnicalValidationResult> {
  if (!model) throw new Error("Choose a working text model before running Technical Validation.");
  if (!context.sku) throw new Error("Generate or select a SKU before running Technical Validation.");

  const notes = Object.entries(context.technicalNotes)
    .map(([label, value]) => `${label}: ${value || "missing"}`)
    .join("\n");
  const result = await aiApi.generateText({
    model,
    instructions: jsonInstructions,
    prompt: [
      "Validate this technical fashion handoff. Be operational, practical, and specific.",
      "",
      "Persona lenses adapted from the SwarmMind-Studio fashion intelligence setup:",
      summarizePersonas(),
      "",
      "Brief context:",
      stringifyBrief({ collection: context.collection, brief: context.brief }),
      "",
      "Design context:",
      `SKU: ${context.sku.name}`,
      `Category: ${context.sku.category}`,
      `Prompt: ${context.sku.prompt}`,
      `Summary: ${context.sku.summary ?? "No summary"}`,
      `Technical assets available: ${context.technicalAssets.length}`,
      "",
      "Manual technical fields:",
      notes,
      "",
      "Return JSON with shape:",
      `{
  "validationSummary": "string",
  "missingFields": ["string"],
  "inconsistencies": ["string"],
  "productionRisks": ["string"],
  "commercialConcerns": ["string"],
  "brandConcerns": ["string"],
  "checklist": [{
    "label": "string",
    "status": "pass | warning | fail",
    "note": "string"
  }],
  "recommendedFixes": ["string"]
}`,
    ].join("\n"),
  });

  try {
    return parseOrThrow(result.text, normalizeTechnicalResult);
  } catch {
    return fallbackTechnical(context);
  }
}
