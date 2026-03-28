"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/common/lib/utils";
import Image from "next/image";

type MetadataAssetPreviewProps = {
  kind: "image" | "icon";
  label: string;
  url: string | null;
  alt: string;
};

export function MetadataAssetPreview({
  kind,
  label,
  url,
  alt,
}: MetadataAssetPreviewProps) {
  const [hasLoadError, setHasLoadError] = useState(false);

  const isAvailable = Boolean(url) && !hasLoadError;
  const frameLabel = kind === "icon" ? "Favicon preview" : "Image preview";

  return (
    <div className="md-dashboard-panel-muted p-4">
      <p className="text-[0.68rem] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <div
        className={cn(
          "mt-3 overflow-hidden rounded-[1.15rem] border border-slate-200/80 bg-white",
          kind === "icon"
            ? "flex min-h-40 items-center justify-center p-6"
            : "relative aspect-[16/9] min-h-40",
        )}
      >
        {isAvailable && url ? (
          kind === "icon" ? (
            <Image
              src={url}
              alt={alt}
              width={64}
              height={64}
              loading="lazy"
              unoptimized
              className="size-16 rounded-[1.15rem] object-contain"
              onError={() => setHasLoadError(true)}
            />
          ) : (
            <Image
              src={url}
              alt={alt}
              fill
              loading="lazy"
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover"
              onError={() => setHasLoadError(true)}
            />
          )
        ) : (
          <div className="flex flex-col items-center gap-3 px-4 text-center text-sm text-slate-500">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ImageOff className="size-5" />
            </div>
            <div>
              <p className="font-medium text-slate-700">{frameLabel}</p>
              <p className="mt-1 leading-6">
                {url ? "Preview unavailable for this asset." : "Not detected."}
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 break-words font-mono text-xs leading-6 text-slate-500">
        {url ?? "Not detected"}
      </p>
    </div>
  );
}
