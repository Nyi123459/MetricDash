"use client";

import { DashboardFrame } from "@/features/dashboard/components/dashboard-frame";
import { MetadataPreviewPanel } from "@/features/dashboard/components/metadata-preview-panel";

export function MetadataDashboard() {
  return (
    <DashboardFrame
      badge="Metadata"
      title="Metadata playground"
      description="Run a real preview request, inspect the normalized response, and review image, favicon, cache, and request details away from the overview page."
    >
      <MetadataPreviewPanel />
    </DashboardFrame>
  );
}
