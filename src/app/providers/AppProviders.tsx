import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { ModelProvider } from "@/app/providers/ModelProvider";
import { StudioProvider } from "@/app/providers/StudioProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <StudioProvider>
        <ModelProvider>{children}</ModelProvider>
      </StudioProvider>
    </BrowserRouter>
  );
}
