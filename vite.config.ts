import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const withoutVersionPath = (value: string) => value.replace(/\/v1\/?$/, "");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const openAiOrigin = withoutVersionPath(env.VITE_OPENAI_BASE_URL || "https://api.openai.com/v1");
  const ollamaOrigin = withoutVersionPath(env.VITE_OLLAMA_BASE_URL || "http://localhost:11434/v1");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    server: {
      proxy: {
        "/__proxy/openai": {
          target: openAiOrigin,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/__proxy\/openai/, ""),
          headers: env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY
            ? { Authorization: `Bearer ${env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY}` }
            : undefined,
        },
        "/__proxy/anthropic": {
          target: "https://api.anthropic.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/__proxy\/anthropic/, ""),
          headers: env.ANTHROPIC_API_KEY || env.VITE_ANTHROPIC_API_KEY
            ? { "x-api-key": env.ANTHROPIC_API_KEY || env.VITE_ANTHROPIC_API_KEY }
            : undefined,
        },
        "/__proxy/ollama": {
          target: ollamaOrigin,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/__proxy\/ollama/, ""),
          headers: env.OLLAMA_API_KEY || env.VITE_OLLAMA_API_KEY
            ? { Authorization: `Bearer ${env.OLLAMA_API_KEY || env.VITE_OLLAMA_API_KEY}` }
            : undefined,
        },
        "/api": {
          target: "http://127.0.0.1:8787",
          changeOrigin: true,
        },
      },
    },
  };
});
