import {
  COMPLAINT_CATEGORIES,
  type ComplaintCategory,
} from "@/domains/complaints/types";

export type ClassificationResult = {
  category: ComplaintCategory;
  description: string;
};

const CATEGORY_SET = new Set<string>(COMPLAINT_CATEGORIES);
const MAX_DESCRIPTION_LENGTH = 500;

function normalizeCategory(value: unknown): ComplaintCategory {
  if (typeof value !== "string") {
    return "OTHER";
  }
  const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
  if (CATEGORY_SET.has(normalized)) {
    return normalized as ComplaintCategory;
  }
  return "OTHER";
}

function normalizeDescription(value: unknown): string {
  if (typeof value !== "string") {
    return "The photograph shows a civic infrastructure issue.";
  }
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return "The photograph shows a civic infrastructure issue.";
  }
  if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
    return `${trimmed.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`;
  }
  return trimmed;
}

function extractJsonObject(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? text.trim();

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("No JSON object found in model output.");
    }
    return JSON.parse(candidate.slice(start, end + 1));
  }
}

export function parseClassificationOutput(raw: string): ClassificationResult {
  const parsed = extractJsonObject(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Model output was not a JSON object.");
  }

  const record = parsed as Record<string, unknown>;
  return {
    category: normalizeCategory(record.category),
    description: normalizeDescription(record.description),
  };
}
