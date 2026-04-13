import { createServer } from "node:http";
import { existsSync, createReadStream, readFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { URL } from "node:url";

const root = resolve(process.cwd());
const port = Number(process.env.PORT || 8787);

loadDotEnv(join(root, ".env"));

const providerLabels = {
  openai: "OpenAI",
  gemini: "Google Gemini",
  anthropic: "Anthropic Claude",
  ollama: "Ollama",
  stability: "Stability AI",
};

const imageModelHints = [
  "image",
  "imagen",
  "dall-e",
  "stable-diffusion",
  "sd3",
  "z-image",
  "flux2",
  "flux.2",
];
const textModelHints = [
  "gpt",
  "o1",
  "o3",
  "o4",
  "chatgpt",
  "claude",
  "gemini",
  "llama",
  "mistral",
  "deepseek",
  "qwen",
];

createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

    if (request.method === "OPTIONS") {
      send(response, 204, undefined);
      return;
    }

    if (url.pathname === "/api/health") {
      send(response, 200, { ok: true });
      return;
    }

    if (url.pathname === "/api/models" && request.method === "GET") {
      send(response, 200, await discoverWorkingModels());
      return;
    }

    if (url.pathname === "/api/generate/text" && request.method === "POST") {
      send(response, 200, await generateText(await readJson(request)));
      return;
    }

    if (url.pathname === "/api/generate/image" && request.method === "POST") {
      send(response, 200, await generateImage(await readJson(request)));
      return;
    }

    if (url.pathname === "/api/generate/photoshoot" && request.method === "POST") {
      send(response, 200, await generatePhotoshoot(await readJson(request)));
      return;
    }

    if (request.method === "GET" && !url.pathname.startsWith("/api/")) {
      await serveStatic(url.pathname, response);
      return;
    }

    send(response, 404, { error: "Not found" });
  } catch (error) {
    send(response, 500, {
      error: error instanceof Error ? error.message : "Unexpected backend error",
    });
  }
}).listen(port, () => {
  console.log(`Studio backend listening on http://127.0.0.1:${port}`);
});

function loadDotEnv(path) {
  if (!existsSync(path)) {
    return;
  }

  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }
    const [rawKey, ...rawValue] = trimmed.split("=");
    const key = rawKey.trim();
    const value = rawValue.join("=").trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function env(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function withTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function send(response, status, body) {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  });
  response.end(body === undefined ? undefined : JSON.stringify(body));
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(json.error?.message || json.error || `${response.status} ${response.statusText}`);
  }
  return json;
}

async function imageUrlToBlob(imageUrl) {
  if (imageUrl.startsWith("data:")) {
    const [meta, data] = imageUrl.split(",");
    const mimeType = meta.match(/^data:(.*?);base64$/)?.[1] || "image/png";
    return new Blob([Buffer.from(data, "base64")], { type: mimeType });
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Unable to fetch reference image: ${response.status} ${response.statusText}`);
  }
  return new Blob([Buffer.from(await response.arrayBuffer())], {
    type: response.headers.get("content-type") || "image/png",
  });
}

async function imageUrlToGeminiInlineData(imageUrl) {
  const blob = await imageUrlToBlob(imageUrl);
  const buffer = Buffer.from(await blob.arrayBuffer());
  return {
    mimeType: blob.type || "image/png",
    data: buffer.toString("base64"),
  };
}

function makeModel(provider, id, kind, source = "provider_list", name = id) {
  return {
    id,
    provider,
    providerLabel: providerLabels[provider],
    name,
    kind,
    status: "working",
    source,
  };
}

function uniqueModels(models) {
  const seen = new Set();
  return models.filter((model) => {
    const key = `${model.provider}:${model.kind}:${model.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function classifyOpenAiModel(id) {
  const normalized = id.toLowerCase();
  if (imageModelHints.some((hint) => normalized.includes(hint))) return "image";
  if (textModelHints.some((hint) => normalized.startsWith(hint) || normalized.includes(`-${hint}`))) {
    return "text";
  }
  return undefined;
}

function normalizeGeminiId(name) {
  return name.replace(/^models\//, "");
}

function classifyGeminiModel(model) {
  const id = normalizeGeminiId(model.name || model.id);
  const label = model.displayName || id;
  const methods = model.supportedGenerationMethods || [];
  const rawName = `${id} ${label}`.toLowerCase();

  if (
    id.startsWith("imagen-") ||
    rawName.includes("image generation") ||
    rawName.includes("flash image") ||
    rawName.includes("nano banana")
  ) {
    return "image";
  }

  if (methods.includes("predict") && id.startsWith("imagen-")) {
    return "image";
  }

  if (methods.includes("generateContent")) {
    return "text";
  }

  return undefined;
}

function classifyOllamaModel(id) {
  const normalized = id.toLowerCase();
  if (
    normalized.includes("z-image") ||
    normalized.includes("flux2") ||
    normalized.includes("flux.2") ||
    normalized.includes("flux2-klein")
  ) {
    return "image";
  }
  return "text";
}

async function listOpenAiModels() {
  const apiKey = env("OPENAI_API_KEY", "VITE_OPENAI_API_KEY");
  if (!apiKey) return [];

  const baseUrl = withTrailingSlash(env("OPENAI_BASE_URL", "VITE_OPENAI_BASE_URL") || "https://api.openai.com/v1");
  const payload = await fetchJson(`${baseUrl}models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const listed = payload.data
    .map((model) => {
      const kind = classifyOpenAiModel(model.id);
      return kind ? makeModel("openai", model.id, kind) : undefined;
    })
    .filter(Boolean);

  const requiredImageModels = ["gpt-image-1.5", "gpt-image-1", "gpt-image-1-mini", "dall-e-3", "dall-e-2"];
  for (const id of requiredImageModels) {
    if (!listed.some((model) => model.id === id)) {
      listed.push(makeModel("openai", id, "image", "validated_static"));
    }
  }

  return listed;
}

async function listGeminiModels() {
  const apiKey = env("GOOGLE_AI_API_KEY", "VITE_GEMINI_API_KEY");
  if (!apiKey) return [];

  const payload = await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const listed = payload.models
    .map((model) => {
      const id = normalizeGeminiId(model.name || model.id);
      const label = model.displayName || id;
      const kind = classifyGeminiModel(model);
      return kind ? makeModel("gemini", id, kind, "provider_list", label) : undefined;
    })
    .filter(Boolean);

  const knownImageModels = [
    ["gemini-2.5-flash-image", "Gemini 2.5 Flash Image"],
    ["gemini-2.0-flash-preview-image-generation", "Gemini 2.0 Flash Preview Image Generation"],
    ["imagen-4.0-generate-001", "Imagen 4"],
    ["imagen-4.0-ultra-generate-001", "Imagen 4 Ultra"],
    ["imagen-4.0-fast-generate-001", "Imagen 4 Fast"],
    ["imagen-3.0-generate-002", "Imagen 3"],
  ];

  for (const [id, label] of knownImageModels) {
    if (!listed.some((model) => model.id === id)) {
      listed.push(makeModel("gemini", id, "image", "validated_static", label));
    }
  }

  return listed;
}

async function listAnthropicModels() {
  const apiKey = env("ANTHROPIC_API_KEY", "VITE_ANTHROPIC_API_KEY");
  if (!apiKey) return [];

  const payload = await fetchJson("https://api.anthropic.com/v1/models", {
    headers: {
      "anthropic-version": "2023-06-01",
      "x-api-key": apiKey,
    },
  });

  return payload.data.map((model) =>
    makeModel("anthropic", model.id, "text", "provider_list", model.display_name || model.id),
  );
}

async function listOllamaModels() {
  const baseUrl = env("OLLAMA_BASE_URL", "VITE_OLLAMA_BASE_URL");
  const configuredModel = env("OLLAMA_MODEL", "VITE_OLLAMA_MODEL");
  if (!baseUrl && !configuredModel) return [];

  const apiKey = env("OLLAMA_API_KEY", "VITE_OLLAMA_API_KEY");
  const normalizedBaseUrl = withTrailingSlash(baseUrl || "http://localhost:11434/v1");
  const payload = await fetchJson(`${normalizedBaseUrl}models`, {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
  });

  const listed = payload.data.map((model) => makeModel("ollama", model.id, classifyOllamaModel(model.id)));
  const configuredImageModel = env("OLLAMA_IMAGE_MODEL", "VITE_OLLAMA_IMAGE_MODEL");
  if (configuredImageModel && !listed.some((model) => model.id === configuredImageModel)) {
    listed.push(makeModel("ollama", configuredImageModel, "image", "configured_model"));
  }

  return listed;
}

async function listStabilityModels() {
  const apiKey = env("STABILITY_API_KEY", "VITE_STABILITY_API_KEY");
  if (!apiKey) return [];

  await fetchJson("https://api.stability.ai/v1/user/account", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  return [
    makeModel("stability", "stable-image-core", "image", "validated_static", "Stable Image Core"),
    makeModel("stability", "stable-image-ultra", "image", "validated_static", "Stable Image Ultra"),
  ];
}

async function discoverWorkingModels() {
  const errors = [];
  const checks = [
    ["OpenAI", listOpenAiModels],
    ["Gemini", listGeminiModels],
    ["Anthropic", listAnthropicModels],
    ["Ollama", listOllamaModels],
    ["Stability", listStabilityModels],
  ];

  const results = await Promise.all(
    checks.map(async ([label, check]) => {
      try {
        return await check();
      } catch (error) {
        errors.push(`${label}: ${error instanceof Error ? error.message : "unavailable"}`);
        return [];
      }
    }),
  );

  const models = uniqueModels(results.flat()).sort((a, b) =>
    `${a.providerLabel} ${a.name}`.localeCompare(`${b.providerLabel} ${b.name}`),
  );

  return {
    textModels: models.filter((model) => model.kind === "text"),
    imageModels: models.filter((model) => model.kind === "image"),
    checkedAt: new Date().toISOString(),
    errors,
  };
}

async function generateText(body) {
  const model = body.model;
  if (!model?.provider || !model?.id) {
    throw new Error("No text model selected.");
  }
  const prompt = String(body.prompt || "").trim();
  if (!prompt) {
    throw new Error("Prompt is required.");
  }

  if (model.provider === "openai") return generateOpenAiText(model.id, prompt, body.instructions);
  if (model.provider === "gemini") return generateGeminiText(model.id, prompt, body.instructions);
  if (model.provider === "anthropic") return generateAnthropicText(model.id, prompt, body.instructions);
  if (model.provider === "ollama") return generateOllamaText(model.id, prompt, body.instructions);

  throw new Error(`${model.provider} text generation is not implemented.`);
}

async function generateImage(body) {
  const model = body.model;
  if (!model?.provider || !model?.id) {
    throw new Error("No image model selected.");
  }
  const prompt = buildFashionImagePrompt(String(body.prompt || "").trim(), {
    identityLock: body.identityLock,
    outfitLock: body.outfitLock,
  });
  if (!prompt) {
    throw new Error("Prompt is required.");
  }

  const referenceImageUrl = body.referenceImageUrl;
  const result =
    model.provider === "openai"
      ? referenceImageUrl
        ? await editOpenAiImage(model.id, prompt, referenceImageUrl)
        : await generateOpenAiImage(model.id, prompt)
      : model.provider === "gemini"
        ? await generateGeminiImage(model.id, prompt, referenceImageUrl)
        : model.provider === "ollama"
          ? await generateOllamaImage(model.id, prompt)
          : model.provider === "stability"
            ? await generateStabilityImage(model.id, prompt)
            : undefined;

  if (result) {
    return { ...result, shotId: body.shotId, prompt };
  }

  throw new Error(`${model.provider} image generation is not implemented yet.`);
}

async function generatePhotoshoot(body) {
  const model = body.model;
  const shots = Array.isArray(body.shots) ? body.shots : [];
  if (!shots.length) {
    throw new Error("Select at least one photoshoot shot.");
  }

  const images = [];
  let referenceImageUrl = body.referenceImageUrl;
  for (const [index, shot] of shots.entries()) {
    const image = await generateImage({
      model,
      shotId: shot.id,
      prompt: [
        `Shot: ${shot.label}.`,
        `Category: ${shot.category}.`,
        shot.prompt,
        index === 0
          ? "This is the master reference image for the person and outfit."
          : "Use the reference image as the identity and outfit source. Preserve the same child, gender presentation, face, hair, skin tone, garment, sleeve length, color, fabric, seams, proportions, and styling. Only change the requested pose, camera angle, crop, lighting, or shot style.",
      ].join(" "),
      identityLock: body.identityLock,
      outfitLock: body.outfitLock,
      referenceImageUrl,
    });
    images.push(image);
    referenceImageUrl = referenceImageUrl || image.imageUrl;
  }

  return { images };
}

function buildFashionImagePrompt(prompt, locks = {}) {
  return [
    prompt,
    "",
    "Continuity lock for the entire photoshoot:",
    locks.identityLock ||
      "Use the same child model in every selected image: same face, same hair, same age, same skin tone, same body proportions.",
    locks.outfitLock ||
      "Use the exact same outfit in every selected image: same garment, same color, same fabric, same fit, same seams and trims.",
    "Do not redesign the clothing between shots. Do not change the person between shots.",
    "Hard continuity rules: do not change girl to boy or boy to girl; do not change short sleeves to long sleeves; do not change shirt type, color, neckline, print, hem, fabric, or fit; do not add jackets, layers, logos, accessories, or new garments unless explicitly requested.",
    "Every shot belongs to the same photoshoot contact sheet, same model, same outfit, different pose/camera/lighting only.",
    "",
    "Mandatory brand and subject rules:",
    "Loom & Spool kids neutral studio preset.",
    "Minimalist premium children clothing SKU. Follow the collection age group, theme, palette, materials, categories, and brand rules stated in the user prompt.",
    "The output must clearly show the requested garment category and construction details.",
    "Use clean e-commerce or calm editorial catalog lighting with neutral background.",
    "Avoid: adult fashion editorial, runway, unrelated garments, logos, text, busy patterns, neon colors, costumes, fantasy elements, cluttered backgrounds, extra objects.",
  ].join("\n");
}

async function generateOpenAiText(model, prompt, instructions) {
  const apiKey = env("OPENAI_API_KEY", "VITE_OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");
  const baseUrl = withTrailingSlash(env("OPENAI_BASE_URL", "VITE_OPENAI_BASE_URL") || "https://api.openai.com/v1");

  const payload = await fetchJson(`${baseUrl}responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions,
      input: prompt,
    }),
  });

  return {
    provider: "openai",
    model,
    text: payload.output_text || extractResponseText(payload),
    raw: payload,
  };
}

async function generateOpenAiImage(model, prompt) {
  const apiKey = env("OPENAI_API_KEY", "VITE_OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");
  const baseUrl = withTrailingSlash(env("OPENAI_BASE_URL", "VITE_OPENAI_BASE_URL") || "https://api.openai.com/v1");

  const payload = await fetchJson(`${baseUrl}images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      size: "1024x1024",
    }),
  });

  const image = payload.data?.[0];
  const imageUrl = image?.b64_json ? `data:image/png;base64,${image.b64_json}` : image?.url;
  if (!imageUrl) {
    throw new Error("Image provider returned no image.");
  }

  return {
    provider: "openai",
    model,
    imageUrl,
    revisedPrompt: image.revised_prompt,
  };
}

async function editOpenAiImage(model, prompt, referenceImageUrl) {
  const apiKey = env("OPENAI_API_KEY", "VITE_OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");
  const baseUrl = withTrailingSlash(env("OPENAI_BASE_URL", "VITE_OPENAI_BASE_URL") || "https://api.openai.com/v1");

  const formData = new FormData();
  formData.set("model", model.startsWith("dall-e") ? "gpt-image-1" : model);
  formData.set("prompt", prompt);
  formData.set("size", "1024x1024");
  formData.set("image", await imageUrlToBlob(referenceImageUrl), "reference.png");

  const response = await fetch(`${baseUrl}images/edits`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(payload.error?.message || payload.error || `${response.status} ${response.statusText}`);
  }

  const image = payload.data?.[0];
  const imageUrl = image?.b64_json ? `data:image/png;base64,${image.b64_json}` : image?.url;
  if (!imageUrl) {
    throw new Error("Image edit provider returned no image.");
  }

  return {
    provider: "openai",
    model,
    imageUrl,
    revisedPrompt: image.revised_prompt,
  };
}

async function generateGeminiText(model, prompt, instructions) {
  const apiKey = env("GOOGLE_AI_API_KEY", "VITE_GEMINI_API_KEY");
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY is missing.");

  const payload = await fetchJson(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: instructions
          ? { parts: [{ text: instructions }] }
          : undefined,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    },
  );

  return {
    provider: "gemini",
    model,
    text: payload.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") || "",
    raw: payload,
  };
}

async function generateGeminiImage(model, prompt, referenceImageUrl) {
  const apiKey = env("GOOGLE_AI_API_KEY", "VITE_GEMINI_API_KEY");
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY is missing.");

  if (model.startsWith("imagen-")) {
    const payload = await fetchJson(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
          },
        }),
      },
    );
    const imageBase64 =
      payload.predictions?.[0]?.bytesBase64Encoded ||
      payload.predictions?.[0]?.image?.bytesBase64Encoded ||
      payload.predictions?.[0]?.bytes_base64_encoded;
    if (!imageBase64) {
      throw new Error("Gemini Imagen returned no image.");
    }
    return {
      provider: "gemini",
      model,
      imageUrl: `data:image/png;base64,${imageBase64}`,
    };
  }

  const referencePart = referenceImageUrl
    ? {
        inlineData: await imageUrlToGeminiInlineData(referenceImageUrl),
      }
    : undefined;
  const payload = await fetchJson(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: referencePart ? [referencePart, { text: prompt }] : [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    },
  );

  const parts = payload.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) => part.inlineData?.data || part.inline_data?.data);
  const textPart = parts.find((part) => part.text);
  const imageBase64 = imagePart?.inlineData?.data || imagePart?.inline_data?.data;
  const mimeType = imagePart?.inlineData?.mimeType || imagePart?.inline_data?.mime_type || "image/png";
  if (!imageBase64) {
    throw new Error("Gemini image model returned no image.");
  }

  return {
    provider: "gemini",
    model,
    imageUrl: `data:${mimeType};base64,${imageBase64}`,
    revisedPrompt: textPart?.text,
  };
}

async function generateAnthropicText(model, prompt, instructions) {
  const apiKey = env("ANTHROPIC_API_KEY", "VITE_ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is missing.");

  const payload = await fetchJson("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      model,
      max_tokens: 900,
      system: instructions,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  return {
    provider: "anthropic",
    model,
    text: payload.content?.map((part) => part.text || "").join("") || "",
    raw: payload,
  };
}

async function generateOllamaText(model, prompt, instructions) {
  const baseUrl = withTrailingSlash(env("OLLAMA_BASE_URL", "VITE_OLLAMA_BASE_URL") || "http://localhost:11434/v1");
  const apiKey = env("OLLAMA_API_KEY", "VITE_OLLAMA_API_KEY");

  const messages = [];
  if (instructions) messages.push({ role: "system", content: instructions });
  messages.push({ role: "user", content: prompt });

  const payload = await fetchJson(`${baseUrl}chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({ model, messages }),
  });

  return {
    provider: "ollama",
    model,
    text: payload.choices?.[0]?.message?.content || "",
    raw: payload,
  };
}

async function generateOllamaImage(model, prompt) {
  const baseUrl = withTrailingSlash(env("OLLAMA_BASE_URL", "VITE_OLLAMA_BASE_URL") || "http://localhost:11434/v1");
  const apiKey = env("OLLAMA_API_KEY", "VITE_OLLAMA_API_KEY") || "ollama";

  const payload = await fetchJson(`${baseUrl}images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      size: "1024x1024",
      response_format: "b64_json",
      n: 1,
    }),
  });

  const imageBase64 = payload.data?.[0]?.b64_json;
  if (!imageBase64) {
    throw new Error("Ollama image endpoint returned no image.");
  }

  return {
    provider: "ollama",
    model,
    imageUrl: `data:image/png;base64,${imageBase64}`,
  };
}

async function generateStabilityImage(model, prompt) {
  const apiKey = env("STABILITY_API_KEY", "VITE_STABILITY_API_KEY");
  if (!apiKey) throw new Error("STABILITY_API_KEY is missing.");

  const endpoint =
    model === "stable-image-ultra"
      ? "https://api.stability.ai/v2beta/stable-image/generate/ultra"
      : "https://api.stability.ai/v2beta/stable-image/generate/core";
  const formData = new FormData();
  formData.set("prompt", prompt);
  formData.set("output_format", "png");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "image/*",
    },
    body: formData,
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    provider: "stability",
    model,
    imageUrl: `data:image/png;base64,${buffer.toString("base64")}`,
  };
}

function extractResponseText(payload) {
  return (
    payload.output
      ?.flatMap((item) => item.content || [])
      .map((content) => content.text || "")
      .join("") || ""
  );
}

async function serveStatic(pathname, response) {
  const filePath = pathname === "/" ? join(root, "dist", "index.html") : join(root, "dist", pathname);
  const safePath = resolve(filePath);
  if (!safePath.startsWith(join(root, "dist")) || !existsSync(safePath)) {
    const fallback = join(root, "dist", "index.html");
    if (!existsSync(fallback)) {
      send(response, 404, { error: "Build output not found. Run npm run build first." });
      return;
    }
    response.writeHead(200, { "Content-Type": "text/html" });
    createReadStream(fallback).pipe(response);
    return;
  }

  const contentTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
  };
  response.writeHead(200, { "Content-Type": contentTypes[extname(safePath)] || "application/octet-stream" });
  createReadStream(safePath).pipe(response);
}
