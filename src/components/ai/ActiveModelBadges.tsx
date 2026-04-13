import { useModels } from "@/app/providers/modelContext";
import { Badge } from "@/components/ui/Badge";

export function ActiveModelBadges() {
  const { isLoading, selectedTextModel, selectedImageModel } = useModels();

  if (isLoading) {
    return <Badge>Checking models</Badge>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {selectedTextModel ? (
        <Badge tone="system">Text: {selectedTextModel.providerLabel} / {selectedTextModel.name}</Badge>
      ) : (
        <Badge>No text model</Badge>
      )}
      {selectedImageModel ? (
        <Badge tone="ai">Image: {selectedImageModel.providerLabel} / {selectedImageModel.name}</Badge>
      ) : (
        <Badge>No image model</Badge>
      )}
    </div>
  );
}
