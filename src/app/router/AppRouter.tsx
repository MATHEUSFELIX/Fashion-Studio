import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/app/layouts/AppShell";
import { routes } from "@/app/router/routes";
import { AssetLibraryPage } from "@/pages/assets/AssetLibraryPage";
import { CollectionsPage } from "@/pages/collections/CollectionsPage";
import { CreateDesignPage } from "@/pages/designs/CreateDesignPage";
import { DesignDetailPage } from "@/pages/designs/DesignDetailPage";
import { VariationsPage } from "@/pages/designs/VariationsPage";
import { ExportCenterPage } from "@/pages/exports/ExportCenterPage";
import { ModelsPage } from "@/pages/models/ModelsPage";
import { AiPhotoshootPage } from "@/pages/outputs/AiPhotoshootPage";
import { ScoringPage } from "@/pages/outputs/ScoringPage";
import { TechnicalFlatPage } from "@/pages/outputs/TechnicalFlatPage";
import { TechnicalValidationPage } from "@/pages/outputs/TechnicalValidationPage";
import { WorkspacePage } from "@/pages/home/WorkspacePage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<WorkspacePage />} />
        <Route path={routes.createDesign.slice(1)} element={<CreateDesignPage />} />
        <Route path="designs/:designId" element={<DesignDetailPage />} />
        <Route path="designs/:designId/variations" element={<VariationsPage />} />
        <Route path="designs/:designId/photoshoot" element={<AiPhotoshootPage />} />
        <Route path="designs/:designId/flat" element={<TechnicalFlatPage />} />
        <Route path="designs/:designId/score" element={<ScoringPage />} />
        <Route path={routes.technicalValidation.slice(1)} element={<TechnicalValidationPage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="assets" element={<AssetLibraryPage />} />
        <Route path="exports" element={<ExportCenterPage />} />
        <Route path="models" element={<ModelsPage />} />
        <Route path="*" element={<Navigate to={routes.workspace} replace />} />
      </Route>
    </Routes>
  );
}
