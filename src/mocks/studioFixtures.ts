import type {
  Asset,
  Collection,
  Design,
  DesignScore,
  DesignVariation,
  ExportBundle,
  GenerationJob,
} from "@/types/domain/studio";
import fabricDetail from "@/assets/images/fabric-detail.png";
import modelFront from "@/assets/images/model-front.png";
import skuPajama from "@/assets/images/sku-pajama.png";
import skuTshirt from "@/assets/images/sku-tshirt.png";

export const collections: Collection[] = [
  {
    id: "col_123",
    title: "Resort Kids 2027",
    season: "Spring preview",
    designIds: ["des_123", "des_456"],
    kpis: { concepts: 12, approved: 5, exportReady: 3 },
  },
  {
    id: "col_789",
    title: "Soft Utility Capsule",
    season: "Early market read",
    designIds: ["des_789"],
    kpis: { concepts: 8, approved: 2, exportReady: 1 },
  },
];

export const designs: Design[] = [
  {
    id: "des_123",
    title: "Summer Kids Dress Concept",
    prompt: "kids floral dress, soft pastel palette, light fabric",
    category: "dress",
    targetAudience: "kids",
    collectionId: "col_123",
    status: "ready",
    source: "ai_generation",
    heroImage: skuTshirt,
    createdAt: "2026-04-10T14:30:00Z",
    updatedAt: "2026-04-12T16:10:00Z",
    attributes: {
      fabric: "cotton voile",
      palette: "pastel botanical",
      silhouette: "relaxed A-line",
      trim: "soft gathered sleeve",
    },
    versionHistory: [
      {
        id: "ver_1",
        label: "Human brief",
        note: "Initial sketch and fit direction",
        source: "human_input",
        createdAt: "2026-04-10T14:30:00Z",
      },
      {
        id: "ver_2",
        label: "AI concept",
        note: "Generated base design with floral layout",
        source: "ai_generation",
        createdAt: "2026-04-10T15:04:00Z",
      },
    ],
  },
  {
    id: "des_456",
    title: "Market Day Pinafore",
    prompt: "layered pinafore with practical pockets and warm trim",
    category: "pinafore",
    targetAudience: "kids",
    collectionId: "col_123",
    status: "processing",
    source: "human_input",
    heroImage: skuPajama,
    createdAt: "2026-04-11T10:12:00Z",
    updatedAt: "2026-04-12T13:24:00Z",
    attributes: {
      fabric: "brushed twill",
      palette: "sage, ivory, ink",
      silhouette: "layered pinafore",
      trim: "contrast binding",
    },
    versionHistory: [],
  },
  {
    id: "des_789",
    title: "Packable Rain Set",
    prompt: "lightweight rain shell and pull-on pant with compact storage",
    category: "outerwear",
    targetAudience: "youth",
    collectionId: "col_789",
    status: "approved",
    source: "system_recommendation",
    heroImage: fabricDetail,
    createdAt: "2026-04-08T09:40:00Z",
    updatedAt: "2026-04-12T11:02:00Z",
    attributes: {
      fabric: "recycled ripstop",
      palette: "moss, citron, graphite",
      silhouette: "boxy shell",
      trim: "sealed pocket flap",
    },
    versionHistory: [],
  },
];

export const variations: DesignVariation[] = [
  {
    id: "var_1",
    designId: "des_123",
    title: "Botanical hem",
    image: skuTshirt,
    palette: "blush and sage",
    silhouette: "A-line",
    score: 88,
    status: "favorite",
    source: "ai_generation",
  },
  {
    id: "var_2",
    designId: "des_123",
    title: "Scattered meadow",
    image: skuPajama,
    palette: "cream and citron",
    silhouette: "tiered",
    score: 82,
    status: "generated",
    source: "ai_generation",
  },
  {
    id: "var_3",
    designId: "des_123",
    title: "Pocket garden",
    image: fabricDetail,
    palette: "sky and clay",
    silhouette: "smock",
    score: 91,
    status: "approved",
    source: "ai_generation",
  },
];

export const assets: Asset[] = [
  {
    id: "asset_1",
    designId: "des_123",
    title: "Concept render",
    type: "concept",
    source: "ai_generation",
    image: designs[0].heroImage,
    createdAt: "2026-04-10T15:04:00Z",
  },
  {
    id: "asset_2",
    designId: "des_123",
    title: "Editorial garden shot",
    type: "photoshoot",
    source: "ai_generation",
    image: modelFront,
    createdAt: "2026-04-12T15:44:00Z",
  },
  {
    id: "asset_3",
    designId: "des_789",
    title: "Technical front flat",
    type: "technical_flat",
    source: "ai_generation",
    image: fabricDetail,
    createdAt: "2026-04-12T12:20:00Z",
  },
];

export const jobs: GenerationJob[] = [
  {
    id: "job_789",
    label: "Generating photoshoot assets",
    status: "processing",
    progress: 62,
    source: "ai_generation",
    relatedDesignId: "des_123",
  },
  {
    id: "job_456",
    label: "Scoring commercial fit",
    status: "queued",
    progress: 18,
    source: "system_recommendation",
    relatedDesignId: "des_456",
  },
];

export const scores: DesignScore[] = [
  {
    designId: "des_123",
    creative: 91,
    commercial: 84,
    operational: 76,
    recommendations: [
      {
        id: "rec_1",
        title: "Reduce trim complexity",
        detail: "One sleeve detail can move to print artwork to improve production readiness.",
        priority: "high",
        source: "system_recommendation",
      },
      {
        id: "rec_2",
        title: "Keep botanical hem",
        detail: "The strongest variation has clear retail storytelling and cleaner photography use.",
        priority: "medium",
        source: "system_recommendation",
      },
    ],
  },
];

export const exportBundles: ExportBundle[] = [
  {
    id: "exp_1",
    title: "Summer Kids Dress handoff",
    assetIds: ["asset_1", "asset_2"],
    status: "complete",
    createdAt: "2026-04-12T17:02:00Z",
  },
];
