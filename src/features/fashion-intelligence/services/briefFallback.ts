import type { CollectionBrief, CollectionPreset } from "@/types/domain/collectionPreset";

export function getFallbackBrief(collection: CollectionPreset): CollectionBrief {
  return {
    concept: `A premium minimalist line of soft everyday pieces for children, focused on ${collection.materials}, ${collection.palette}. Every generated image should read like a kidswear SKU or neutral catalog photoshoot.`,
    keyDesignPrinciples: [
      `Palette: ${collection.palette}.`,
      `Materials: ${collection.materials}.`,
      `Age group: ${collection.ageGroup}.`,
      collection.rules,
    ],
    categories: collection.categories.map((category) => ({
      name: category,
      details: "Simple construction, soft hand feel, clean neutral presentation.",
    })),
    rulesApplied: collection.rules,
  };
}
