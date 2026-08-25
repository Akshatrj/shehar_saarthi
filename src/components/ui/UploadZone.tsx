"use client";

import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type UploadZoneProps = {
  accept?: string;
  disabled?: boolean;
  error?: string;
  maxSizeLabel?: string;
  previewUrl?: string | null;
  onFileChange: (file: File | null) => void;
};

export function UploadZone({
  accept = "image/jpeg,image/png,image/webp",
  disabled = false,
  error,
  maxSizeLabel = "PNG, JPG or WebP up to 8 MB",
  previewUrl,
  onFileChange,
}: UploadZoneProps) {
  const inputId = useId();
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(fileList: FileList | null) {
    const file = fileList?.[0] ?? null;
    onFileChange(file);
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "ss-upload-zone relative rounded-xl border-2 border-dashed p-6 text-center transition-colors",
          dragOver && "border-brand bg-brand-50/60",
          error ? "border-danger/50 bg-danger-bg/30" : "border-line bg-paper",
          disabled && "opacity-60",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) {
            setDragOver(true);
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (!disabled) {
            handleFiles(event.dataTransfer.files);
          }
        }}
      >
        {previewUrl ? (
          <div className="relative mx-auto h-44 w-full max-w-sm overflow-hidden rounded-lg border border-line">
            <Image
              src={previewUrl}
              alt="Selected complaint photograph preview"
              fill
              unoptimized
              className="object-cover"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute right-2 top-2 bg-paper-raised/95"
              disabled={disabled}
              onClick={() => onFileChange(null)}
              aria-label="Remove photo"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        ) : (
          <>
            <ImagePlus
              className="mx-auto h-10 w-10 text-brand"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p className="mt-3 text-body font-medium text-navy">
              Upload complaint photo
            </p>
            <p className="mt-1 text-small text-muted">{maxSizeLabel}</p>
            <label htmlFor={inputId} className="mt-4 inline-block">
              <span className="ss-btn-civic inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md bg-brand px-4 text-small font-medium text-white hover:bg-brand-dark">
                Choose photo
              </span>
            </label>
          </>
        )}

        <input
          id={inputId}
          type="file"
          accept={accept}
          capture="environment"
          disabled={disabled}
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>
      {error ? (
        <p className="text-small text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
