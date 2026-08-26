"use client";

import { FormEvent, useMemo, useState } from "react";
import { Keyboard, LocateFixed, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { ComplaintSuccessPanel } from "@/components/citizen/ComplaintSuccessPanel";
import { CategoryPicker } from "@/components/citizen/CategoryPicker";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ChoiceTile } from "@/components/ui/ChoiceTile";
import { Field, RequiredMark, controlClassName } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { UploadZone } from "@/components/ui/UploadZone";
import { useToast } from "@/components/ui/Toast";
import { LazyLocationPickerMap } from "@/components/maps/LazyLocationPickerMap";
import { MAX_COMPLAINT_IMAGE_BYTES, type CitizenComplaintSummary } from "@/domains/complaints/constants";
import {
  COMPLAINT_CATEGORY_LABELS,
  type ComplaintCategory,
} from "@/domains/complaints/types";
import {
  WIZARD_LEAVE_MESSAGE,
  hasWizardProgress,
  validateWizardStep,
  type WizardFieldErrors,
} from "@/domains/complaints/wizard-validation";
import { cn } from "@/lib/cn";

type FormState = "idle" | "uploading" | "submitting" | "success" | "error";
type WizardStep = 1 | 2 | 3;
type LocationMethod = "gps" | "map" | "manual";

type FieldErrors = WizardFieldErrors;

const STEPS = [
  { id: 1, label: "Category" },
  { id: 2, label: "Details" },
  { id: 3, label: "Location" },
] as const;

const LOCATION_METHODS: Array<{
  id: LocationMethod;
  title: string;
  description: string;
  icon: typeof MapPin;
}> = [
  {
    id: "gps",
    title: "Current location",
    description: "Detect GPS from this device",
    icon: LocateFixed,
  },
  {
    id: "map",
    title: "Pin on map",
    description: "Search or click the map to drop a pin",
    icon: MapPin,
  },
  {
    id: "manual",
    title: "Enter coordinates",
    description: "Type latitude and longitude",
    icon: Keyboard,
  },
];

function WizardProgress({ step }: { step: WizardStep }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Report steps">
      {STEPS.map((item) => {
        const current = item.id === step;
        const complete = item.id < step;
        return (
          <li key={item.id} className="flex flex-col gap-1">
            <span
              className={cn(
                "h-1.5 rounded-full",
                complete || current ? "bg-brand" : "bg-line",
              )}
            />
            <span
              className={cn(
                "text-xs font-medium",
                current ? "text-navy" : "text-muted",
              )}
            >
              {item.id}. {item.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function ReportIssueForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<WizardStep>(1);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [category, setCategory] = useState<ComplaintCategory | null>(null);
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationMethod, setLocationMethod] = useState<LocationMethod>("map");
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

  const wizardInput = {
    photo,
    category,
    description,
    latitude,
    longitude,
    phone,
  };

  function leaveWizard() {
    if (hasWizardProgress(wizardInput) && !window.confirm(WIZARD_LEAVE_MESSAGE)) {
      return;
    }
    router.push("/citizen");
  }

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

  function captureCurrentLocation() {
    setLocationMethod("gps");
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
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setFormState("idle");
        toast("Location captured from your device.", "success");
      },
      () => {
        setFieldErrors((current) => ({
          ...current,
          form: "Could not read your location. Pin the map or enter coordinates.",
        }));
        setFormState("idle");
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  function goToDetails() {
    const errors = validateWizardStep(1, wizardInput);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setStep(2);
  }

  function goToLocation() {
    const errors = validateWizardStep(2, wizardInput);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setStep(3);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || submitSucceeded) {
      return;
    }
    if (step !== 3) {
      return;
    }

    const errors = validateWizardStep(3, wizardInput);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormState("error");
      if (errors.category) {
        setStep(1);
      } else if (errors.photo || errors.description || errors.phone) {
        setStep(2);
      }
      return;
    }

    setFieldErrors({});
    setFormState("submitting");

    const body = new FormData();
    body.set("photo", photo as File);
    body.set("category", category as string);
    body.set("description", description.trim());
    body.set("latitude", latitude.trim());
    body.set("longitude", longitude.trim());
    if (phone.trim()) {
      body.set("phone", phone.trim());
    }

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
    setCategory(null);
    setDescription("");
    setPhone("");
    setLatitude("");
    setLongitude("");
    setLocationMethod("map");
    setFieldErrors({});
    setFormState("idle");
    setStep(1);
  }

  if (submitSucceeded && submitted) {
    return <ComplaintSuccessPanel complaint={submitted} onReportAnother={resetForm} />;
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
      <WizardProgress step={step} />

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

      {step === 1 ? (
        <div className="flex flex-col gap-5">
          <CategoryPicker
            selectedCategory={category}
            disabled={busy}
            categoryError={fieldErrors.category}
            onCategoryChange={(value) => {
              setCategory(value);
              setFieldErrors((current) => ({
                ...current,
                category: undefined,
                form: undefined,
              }));
            }}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={leaveWizard}
            >
              Cancel
            </Button>
            <Button type="button" disabled={busy} onClick={goToDetails}>
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-5">
          <div>
            <h3 className="text-body font-semibold text-navy">
              Add details
              <RequiredMark />
            </h3>
            <p className="mt-1 text-small text-muted">
              Reporting{" "}
              <span className="font-medium text-navy">
                {category ? COMPLAINT_CATEGORY_LABELS[category] : "an issue"}
              </span>
              . A photo and short description help staff act faster.
            </p>
          </div>
          <UploadZone
            required
            disabled={busy}
            error={fieldErrors.photo}
            previewUrl={photoPreview}
            onFileChange={onPhotoChange}
          />
          <Field
            label="Description"
            required
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
                aria-required="true"
                className={cn(controlClassName, "min-h-24 border-line py-2")}
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
          <Field
            label="Phone"
            hint="Optional. 10-digit mobile number, or +91 followed by 10 digits."
            error={fieldErrors.phone}
          >
            {({ id, describedBy, invalid }) => (
              <input
                id={id}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                disabled={busy}
                value={phone}
                placeholder="e.g. 9876543210"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                className={cn(controlClassName, "border-line")}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setFieldErrors((current) => ({
                    ...current,
                    phone: undefined,
                    form: undefined,
                  }));
                }}
              />
            )}
          </Field>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={leaveWizard}
              >
                Cancel
              </Button>
            </div>
            <Button type="button" disabled={busy} onClick={goToLocation}>
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="flex flex-col gap-5">
          <div>
            <h3 className="text-body font-semibold text-navy">
              Where is the issue?
              <RequiredMark />
            </h3>
            <p className="mt-1 text-small text-muted">
              Choose how to set the location. You can switch methods at any time.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Location method"
            className="grid gap-2 md:grid-cols-3"
          >
            {LOCATION_METHODS.map((method) => {
              const Icon = method.icon;
              const selected = locationMethod === method.id;
              return (
                <ChoiceTile
                  key={method.id}
                  selected={selected}
                  role="radio"
                  aria-checked={selected}
                  disabled={busy}
                  onClick={() => {
                    setLocationMethod(method.id);
                    if (method.id === "gps") {
                      captureCurrentLocation();
                    }
                  }}
                >
                  <span className="ss-choice-tile__icon">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="ss-choice-tile__title">{method.title}</span>
                    <span className="ss-choice-tile__muted">{method.description}</span>
                  </span>
                </ChoiceTile>
              );
            })}
          </div>

          <LazyLocationPickerMap
            latitude={latitude}
            longitude={longitude}
            disabled={busy}
            showSearch={locationMethod === "map"}
            onPick={(nextLat, nextLng) => {
              setLocationMethod("map");
              setLatitude(String(nextLat));
              setLongitude(String(nextLng));
              setFieldErrors((current) => ({
                ...current,
                latitude: undefined,
                longitude: undefined,
                form: undefined,
              }));
            }}
          />

          {locationMethod === "manual" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Latitude" required error={fieldErrors.latitude}>
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
                    aria-required="true"
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
              <Field label="Longitude" required error={fieldErrors.longitude}>
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
                    aria-required="true"
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
          ) : null}

          {locationMethod !== "manual" && (fieldErrors.latitude || fieldErrors.longitude) ? (
            <p className="text-small text-danger" role="alert">
              {fieldErrors.latitude ?? fieldErrors.longitude}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={leaveWizard}
              >
                Cancel
              </Button>
            </div>
            <Button type="submit" disabled={busy} className="min-w-[11rem]">
              {formState === "submitting" ? "Submitting…" : "Submit complaint"}
            </Button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
