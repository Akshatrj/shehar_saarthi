import { MAX_COMPLAINT_IMAGE_BYTES } from "@/domains/complaints/constants";
import {
  ComplaintValidationError,
  validateOptionalContactPhone,
} from "@/domains/complaints/validation";

export const COMPULSORY_MESSAGE = "Compulsory field not filled.";

export const WIZARD_LEAVE_MESSAGE =
  "Your complaint has not been saved. Leave anyway?";

export type WizardFieldErrors = {
  photo?: string;
  category?: string;
  description?: string;
  latitude?: string;
  longitude?: string;
  phone?: string;
  form?: string;
};

export type WizardInput = {
  photo: { size: number } | null;
  category: string | null;
  description: string;
  latitude: string;
  longitude: string;
  phone: string;
};

export function hasWizardProgress(input: WizardInput) {
  return Boolean(
    input.category ||
      input.photo ||
      input.description.trim() ||
      input.latitude.trim() ||
      input.longitude.trim() ||
      input.phone.trim(),
  );
}

export function validateWizardStep(
  step: 1 | 2 | 3,
  input: WizardInput,
): WizardFieldErrors {
  const errors: WizardFieldErrors = {};
  let missingRequired = false;

  if (step === 1 || step === 3) {
    if (!input.category) {
      errors.category = "Please choose a complaint category.";
      missingRequired = true;
    }
  }

  if (step === 2 || step === 3) {
    if (!input.photo || input.photo.size === 0) {
      errors.photo = "Please add a photograph of the problem.";
      missingRequired = true;
    } else if (input.photo.size > MAX_COMPLAINT_IMAGE_BYTES) {
      errors.photo = "Photos must be 8 MB or smaller.";
    }

    if (!input.description.trim() || input.description.trim().length < 12) {
      errors.description =
        "Please describe the problem in at least 12 characters.";
      missingRequired = true;
    }

    if (input.phone.trim()) {
      try {
        validateOptionalContactPhone(input.phone);
      } catch (error) {
        if (error instanceof ComplaintValidationError) {
          errors.phone = error.message;
        } else {
          throw error;
        }
      }
    }
  }

  if (step === 3) {
    const lat = Number(input.latitude);
    if (
      !input.latitude.trim() ||
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90
    ) {
      errors.latitude = "Latitude must be between -90 and 90.";
      if (!input.latitude.trim()) {
        missingRequired = true;
      }
    }

    const lng = Number(input.longitude);
    if (
      !input.longitude.trim() ||
      !Number.isFinite(lng) ||
      lng < -180 ||
      lng > 180
    ) {
      errors.longitude = "Longitude must be between -180 and 180.";
      if (!input.longitude.trim()) {
        missingRequired = true;
      }
    }
  }

  if (missingRequired) {
    errors.form = COMPULSORY_MESSAGE;
  }

  return errors;
}
