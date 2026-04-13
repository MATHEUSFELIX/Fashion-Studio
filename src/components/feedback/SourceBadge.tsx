import { Badge } from "@/components/ui/Badge";
import type { SourceKind } from "@/types/domain/studio";

const sourceCopy: Record<SourceKind, string> = {
  human_input: "Human input",
  ai_generation: "AI generation",
  system_recommendation: "System recommendation",
};

const sourceTone: Record<SourceKind, "human" | "ai" | "system"> = {
  human_input: "human",
  ai_generation: "ai",
  system_recommendation: "system",
};

export function SourceBadge({ source }: { source: SourceKind }) {
  return <Badge tone={sourceTone[source]}>{sourceCopy[source]}</Badge>;
}
