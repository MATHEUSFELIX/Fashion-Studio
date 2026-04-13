import type { ModelOption, ModelRegistryState } from "@/types/domain/models";

interface GenerateTextRequest {
  model: Pick<ModelOption, "provider" | "id">;
  instructions?: string;
  prompt: string;
}

interface GenerateTextResponse {
  provider: string;
  model: string;
  text: string;
}

interface GenerateImageRequest {
  model: Pick<ModelOption, "provider" | "id">;
  prompt: string;
  shotId?: string;
  identityLock?: string;
  outfitLock?: string;
}

export interface GenerateImageResponse {
  provider: string;
  model: string;
  imageUrl: string;
  revisedPrompt?: string;
  shotId?: string;
  prompt?: string;
}

export interface GeneratePhotoshootShot {
  id: string;
  label: string;
  category: string;
  prompt: string;
}

interface GeneratePhotoshootRequest {
  model: Pick<ModelOption, "provider" | "id">;
  identityLock: string;
  outfitLock: string;
  shots: GeneratePhotoshootShot[];
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || "AI request failed.");
  }
  return payload;
}

export const aiApi = {
  listModels: async (): Promise<ModelRegistryState> => {
    const response = await fetch("/api/models");
    const payload = (await response.json()) as ModelRegistryState & { error?: string };
    if (!response.ok) {
      throw new Error(payload.error || "Unable to load models.");
    }
    return payload;
  },
  generateText: (request: GenerateTextRequest): Promise<GenerateTextResponse> =>
    postJson("/api/generate/text", request),
  generateImage: (request: GenerateImageRequest): Promise<GenerateImageResponse> =>
    postJson("/api/generate/image", request),
  generatePhotoshoot: (request: GeneratePhotoshootRequest): Promise<{ images: GenerateImageResponse[] }> =>
    postJson("/api/generate/photoshoot", request),
};
