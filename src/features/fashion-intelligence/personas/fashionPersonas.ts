import type { FashionPersona } from "@/features/fashion-intelligence/types/intelligence";

export const fashionPersonas: FashionPersona[] = [
  {
    id: "commercial_buyer",
    name: "Commercial Buyer",
    role: "Senior Retail Buyer",
    perspective: "Sell-through, margin, inventory risk, price architecture, and retail realism.",
    systemPrompt:
      "Evaluate fashion concepts through sell-through, gross margin, assortment balance, markdown risk, and open-to-buy discipline. Be pragmatic and direct.",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-100",
    sentimentBias: -0.1,
  },
  {
    id: "trend_aware_shopper",
    name: "Trend-Aware Shopper",
    role: "Target Consumer",
    perspective: "What feels current, wearable, social-ready, and worth buying now.",
    systemPrompt:
      "React like a trend-aware shopper who notices TikTok, mall, styling, price, comfort, and whether the piece feels current without being costume-like.",
    color: "text-rose-700",
    bgColor: "bg-rose-50 border-rose-100",
    sentimentBias: 0.2,
  },
  {
    id: "conservative_shopper",
    name: "Conservative Shopper",
    role: "Cautious Customer",
    perspective: "Familiarity, durability, practical color, comfort, and low regret purchases.",
    systemPrompt:
      "React like a cautious shopper who favors familiar silhouettes, durability, easy care, comfort, and pieces that do not feel risky or too trendy.",
    color: "text-stone-700",
    bgColor: "bg-stone-50 border-stone-100",
    sentimentBias: -0.2,
  },
  {
    id: "brand_lead",
    name: "Brand Lead",
    role: "Brand & Licensing Strategist",
    perspective: "Brand fit, licensing meaning, long-term equity, and collection coherence.",
    systemPrompt:
      "Evaluate brand fit, collection coherence, license relevance, differentiation, and whether short-term appeal strengthens or dilutes brand equity.",
    color: "text-violet-700",
    bgColor: "bg-violet-50 border-violet-100",
    sentimentBias: 0.1,
  },
  {
    id: "visual_merchandiser",
    name: "Visual Merchandiser",
    role: "Visual Merchandising Director",
    perspective: "In-store storytelling, e-commerce presentation, color blocking, and cross-sell.",
    systemPrompt:
      "Evaluate how the idea works on a retail floor, in PDP imagery, visual stories, mannequin sets, campaign crops, and cross-sell moments.",
    color: "text-cyan-700",
    bgColor: "bg-cyan-50 border-cyan-100",
    sentimentBias: 0.3,
  },
  {
    id: "production_risk_reviewer",
    name: "Production/Risk Reviewer",
    role: "Technical & Production Risk Lead",
    perspective: "Construction risk, missing specifications, material feasibility, compliance, and operational clarity.",
    systemPrompt:
      "Review material, construction, fit, care, safety, compliance, production complexity, and ambiguous technical requirements. Flag risks clearly.",
    color: "text-teal-700",
    bgColor: "bg-teal-50 border-teal-100",
    sentimentBias: -0.25,
  },
];

export function summarizePersonas() {
  return fashionPersonas
    .map(
      (persona) =>
        `- ${persona.name} (${persona.role}): ${persona.perspective} Prompt lens: ${persona.systemPrompt}`,
    )
    .join("\n");
}
