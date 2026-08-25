"use client";

import { FormEvent, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { ComplaintSuccessPanel } from "@/components/citizen/ComplaintSuccessPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, controlClassName } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { UploadZone } from "@/components/ui/UploadZone";
import { useToast } from "@/components/ui/Toast";
import type { CitizenComplaintSummary } from "@/domains/complaints/constants";
import { MAX_COMPLAINT_IMAGE_BYTES } from "@/domains/complaints/constants";
import { cn } from "@/lib/cn";

type FormState = "idle" | "uploading" | "submitting" | "success" | "error";

type FieldErrors = {
  photo?: string;
  description?: string;
  latitude?: string;
  longitude?: string;
  form?: string;
};

function clientValidate(input: {
  photo: File | null;
  description: string;
  latitude: string;
  longitude: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.photo || input.photo.size === 0) {
    errors.photo = "Please add a photograph of the problem.";
  } else if (input.photo.size > MAX_COMPLAINT_IMAGE_BYTES) {
    errors.photo = "Photos must be 8 MB or smaller.";
  }
  if (input.description.trim().length < 12) {
    errors.description = "Please describe the problem in at least 12 characters.";
  }
  const lat = Number(input.latitude);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    errors.latitude = "Latitude must be between -90 and 90.";
  }
  const lng = Number(input.longitude);
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    errors.longitude = "Longitude must be between -180 and 180.";
  }
  return errors;
}

export function ReportIssueForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formState, setFormState] = useState<FormState>("idle");
  const [submitted, setSubmitted] = useState<CitizenComplaintSummary | null>(null);

  const busy = formState === "uploading" || formState === "submitting";
  const submitSucceeded = formState === "success" && submitted;

  const statusLabel = useMemo(() => {
    if (formState === "uploading") {
      return "Preparing photo…";
    }
    if (formState === "submitting") {
      return "Submitting complaint…";
    }
    return null;
  }, [formState]);

  function onPhotoChange(file: File | null) {
    setFieldErrors((current) => ({ ...current, photo: undefined, form: undefined }));
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    if (!file) {
      setPhoto(null);
      setPhotoPreview(null);
      return;
    }
    if (file.size > MAX_COMPLAINT_IMAGE_BYTES) {
      setFieldErrors((current) => ({
        ...current,
        photo: "Photos must be 8 MB or smaller.",
      }));
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setFormState("uploading");
    window.setTimeout(() => {
      setFormState("idle");
    }, 350);
  }

  function useCurrentLocation() {
    setFieldErrors((current) => ({
      ...current,
      latitude: undefined,
      longitude: undefined,
      form: undefined,
    }));
    if (!navigator.geolocation) {
      setFieldErrors((current) => ({
        ...current,
        form: "Location is not available in this browser.",
      }));
      return;
    }
    setFormState("uploading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude));
        setLongitude(String(position.coords.longitude));
        setFormState("idle");
        toast("Location captured from your device.", "success");
      },
      () => {
        setFieldErrors((current) => ({
          ...current,
          form: "Could not read your location. Enter coordinates manually.",
        }));
        setFormState("idle");
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || submitSucceeded) {
      return;
    }

    const errors = clientValidate({ photo, description, latitude, longitude });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormState("error");
      return;
    }

    setFieldErrors({});
    setFormState("submitting");

    const body = new FormData();
    body.set("photo", photo as File);
    body.set("description", description.trim());
    body.set("latitude", latitude.trim());
    body.set("longitude", longitude.trim());

    try {
      const response = await fetch("/api/v1/complaints", {
        method: "POST",
        body,
      });
      const payload = (await response.json()) as {
        data?: { complaint: CitizenComplaintSummary };
        message?: string;
      };

      if (!response.ok) {
        const message = payload.message ?? "Something went wrong. Please try again.";
        setFieldErrors({ form: message });
        setFormState("error");
        toast(message, "error");
        return;
      }

      const complaint = payload.data?.complaint ?? null;
      if (complaint?.imageUrl) {
        void fetch("/api/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: complaint.imageUrl }),
        }).catch(() => {
          // Classification is optional; submission already succeeded.
        });
      }

      setSubmitted(complaint);
      setFormState("success");
      toast("Complaint submitted successfully.", "success");
    } catch {
      const message =
        "Network error while submitting. Check your connection and try again.";
      setFieldErrors({ form: message });
      setFormState("error");
      toast(message, "error");
    }
  }

  function resetForm() {
    setSubmitted(null);
    setPhoto(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
    setDescription("");
    setLatitude("");
    setLongitude("");
    setFieldErrors({});
    setFormState("idle");
  }

  if (submitSucceeded && submitted) {
    return <ComplaintSuccessPanel complaint={submitted} onReportAnother={resetForm} />;
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
      {fieldErrors.form ? (
        <Alert variant="danger" live="assertive">
          {fieldErrors.form}
        </Alert>
      ) : null}

      {statusLabel ? (
        <div className="rounded-md border border-line bg-paper-raised px-4 py-3">
          <Spinner label={statusLabel} />
        </div>
      ) : null}

      <UploadZone
        disabled={busy}
        error={fieldErrors.photo}
        previewUrl={photoPreview}
        onFileChange={onPhotoChange}
      />

      <Field
        label="Description"
        hint="What is wrong, and where should staff look?"
        error={fieldErrors.description}
      >
        {({ id, describedBy, invalid }) => (
          <textarea
            id={id}
            name="description"
            rows={4}
            disabled={busy}
            value={description}
            placeholder="Describe the civic issue clearly…"
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className={cn(controlClassName, "min-h-28 border-line py-2")}
            onChange={(event) => {
              setDescription(event.target.value);
              setFieldErrors((current) => ({
                ...current,
                description: undefined,
                form: undefined,
              }));
            }}
          />
        )}
      </Field>

      <div className="rounded-xl border border-line bg-brand-50/40 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h3 className="text-body font-semibold text-navy">Complaint location</h3>
            <p className="mt-1 text-small text-muted">
              Pin where the issue is located. Use your current location or enter
              coordinates manually.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Latitude" error={fieldErrors.latitude}>
            {({ id, describedBy, invalid }) => (
              <input
                id={id}
                name="latitude"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                disabled={busy}
                value={latitude}
                placeholder="e.g. 28.6139"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                className={cn(controlClassName, "border-line")}
                onChange={(event) => {
                  setLatitude(event.target.value);
                  setFieldErrors((current) => ({
                    ...current,
                    latitude: undefined,
                    form: undefined,
                  }));
                }}
              />
            )}
          </Field>

          <Field label="Longitude" error={fieldErrors.longitude}>
            {({ id, describedBy, invalid }) => (
              <input
                id={id}
                name="longitude"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                disabled={busy}
                value={longitude}
                placeholder="e.g. 77.2090"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                className={cn(controlClassName, "border-line")}
                onChange={(event) => {
                  setLongitude(event.target.value);
                  setFieldErrors((current) => ({
                    ...current,
                    longitude: undefined,
                    form: undefined,
                  }));
                }}
              />
            )}
          </Field>
        </div>

        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={useCurrentLocation}
          >
            Use my current location
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-2">
        <Button type="submit" disabled={busy} className="ss-btn-civic min-w-[11rem]">
          {formState === "submitting" ? "Submitting…" : "Submit Complaint"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => router.push("/citizen")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
