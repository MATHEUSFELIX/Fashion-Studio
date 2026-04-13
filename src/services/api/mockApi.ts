import {
  assets,
  collections,
  designs,
  exportBundles,
  jobs,
  scores,
  variations,
} from "@/mocks/studioFixtures";
import skuPajama from "@/assets/images/sku-pajama.png";
import skuTshirt from "@/assets/images/sku-tshirt.png";
import type {
  CreateDesignRequest,
  CreateDesignResponse,
  CreateExportRequest,
  GenerateFlatRequest,
  GeneratePhotoshootRequest,
  GenerateVariationsRequest,
} from "@/types/api/contracts";
import type {
  Asset,
  Collection,
  Design,
  DesignScore,
  DesignVariation,
  ExportBundle,
  GenerationJob,
} from "@/types/domain/studio";

const wait = <T>(value: T, delay = 280): Promise<T> =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });

export interface WorkspaceSummary {
  recentDesigns: Design[];
  recentCollections: Collection[];
  recentAssets: Asset[];
  jobs: GenerationJob[];
}

export const api = {
  getWorkspace: (): Promise<WorkspaceSummary> =>
    wait({
      recentDesigns: designs,
      recentCollections: collections,
      recentAssets: assets,
      jobs,
    }),

  createDesign: (
    request: CreateDesignRequest,
    generated?: { imageUrl?: string; summary?: string },
  ): Promise<CreateDesignResponse> => {
    const id = `des_${Date.now()}`;
    const jobId = `job_${Date.now()}`;
    designs.unshift({
      id,
      title: request.title,
      prompt: request.prompt,
      category: request.category,
      targetAudience: request.target_audience,
      collectionId: request.collection_id,
      status: "processing",
      source: "human_input",
      heroImage:
        generated?.imageUrl ??
        (request.category === "pajama" ? skuPajama : skuTshirt),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attributes: {
        input: request.input_type,
        category: request.category,
        audience: request.target_audience,
      },
      versionHistory: [
        {
          id: `ver_${Date.now()}`,
          label: "Human brief",
          note: generated?.summary ?? request.prompt,
          source: "human_input",
          createdAt: new Date().toISOString(),
        },
      ],
    });
    jobs.unshift({
      id: jobId,
      label: `Generating ${request.title}`,
      status: "processing",
      progress: 34,
      source: "ai_generation",
      relatedDesignId: id,
    });
    return wait({ design_id: id, status: "processing", job_id: jobId }, 420);
  },

  getDesign: (designId: string): Promise<Design | undefined> =>
    wait(designs.find((design) => design.id === designId)),

  generateVariations: (
    designId: string,
    request: GenerateVariationsRequest,
  ): Promise<GenerationJob> => {
    void request;
    return wait({
      id: `job_var_${Date.now()}`,
      label: "Generating variation set",
      status: "processing",
      progress: 48,
      source: "ai_generation",
      relatedDesignId: designId,
    });
  },

  listVariations: (designId: string): Promise<DesignVariation[]> =>
    wait(variations.filter((variation) => variation.designId === designId)),

  generatePhotoshoot: (
    designId: string,
    request: GeneratePhotoshootRequest,
  ): Promise<GenerationJob> => {
    void request;
    return wait({
      id: `job_photo_${Date.now()}`,
      label: "Generating photoshoot",
      status: "processing",
      progress: 51,
      source: "ai_generation",
      relatedDesignId: designId,
    });
  },

  generateFlat: (designId: string, request: GenerateFlatRequest): Promise<GenerationJob> => {
    void request;
    return wait({
      id: `job_flat_${Date.now()}`,
      label: "Generating technical flat",
      status: "processing",
      progress: 44,
      source: "ai_generation",
      relatedDesignId: designId,
    });
  },

  scoreDesign: (designId: string): Promise<DesignScore> =>
    wait(
      scores.find((score) => score.designId === designId) ?? {
        designId,
        creative: 78,
        commercial: 72,
        operational: 69,
        recommendations: [
          {
            id: "rec_default",
            title: "Request more market context",
            detail: "Add intended price point and channel before final approval.",
            priority: "medium",
            source: "system_recommendation",
          },
        ],
      },
    ),

  addDesignToCollection: (collectionId: string, designId: string): Promise<Collection | undefined> => {
    const collection = collections.find((item) => item.id === collectionId);
    if (collection && !collection.designIds.includes(designId)) {
      collection.designIds.push(designId);
    }
    return wait(collection);
  },

  listAssets: (type?: Asset["type"], designId?: string): Promise<Asset[]> =>
    wait(
      assets.filter((asset) => {
        const typeMatches = type ? asset.type === type : true;
        const designMatches = designId ? asset.designId === designId : true;
        return typeMatches && designMatches;
      }),
    ),

  createExport: (request: CreateExportRequest): Promise<ExportBundle> => {
    const bundle: ExportBundle = {
      id: `exp_${Date.now()}`,
      title: request.title,
      assetIds: request.asset_ids,
      status: "processing",
      createdAt: new Date().toISOString(),
    };
    exportBundles.unshift(bundle);
    return wait(bundle);
  },

  listCollections: (): Promise<Collection[]> => wait(collections),
  listExports: (): Promise<ExportBundle[]> => wait(exportBundles),
};
