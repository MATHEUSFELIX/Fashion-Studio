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
