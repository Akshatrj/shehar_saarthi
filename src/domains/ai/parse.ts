import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_CATEGORY_LABELS,
  type ComplaintCategory,
} from "@/domains/complaints/types";
import type { EvidenceConsistency, GeminiRawAnalysis } from "@/domains/ai/types";
import { clampConfidence, clampScore } from "@/domains/ai/priority";
import { DEPARTMENT_NAMES, DEPARTMENT_SLUGS } from "@/domains/complaints/categories";

const CATEGORY_SET = new Set<string>(COMPLAINT_CATEGORIES);
const EVIDENCE_VALUES = new Set<EvidenceConsistency>([
  "CONSISTENT",
  "POTENTIAL_MISMATCH",
  "NEEDS_REVIEW",
  "INCONCLUSIVE",
]);

const DEPARTMENT_NAMES_SET = new Set<string>(Object.values(DEPARTMENT_NAMES));

const LABEL_TO_ENUM = Object.fromEntries(
  Object.entries(COMPLAINT_CATEGORY_LABELS).map(([key, label]) => [
    label.toLowerCase(),
    key,
  ]),
) as Record<string, ComplaintCategory>;

export type SimpleClassificationResult = {
  category: ComplaintCategory;
  description: string;
};

const MAX_DESCRIPTION_LENGTH = 500;

function normalizeCategory(value: unknown): ComplaintCategory {
  if (typeof value !== "string") return "OTHER";
  const trimmed = value.trim();
  const upper = trimmed.toUpperCase().replace(/\s+/g, "_");
  if (CATEGORY_SET.has(upper)) {
    return upper as ComplaintCategory;
  }
  const fromLabel = LABEL_TO_ENUM[trimmed.toLowerCase()];
  if (fromLabel) return fromLabel;
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

function normalizeEvidence(value: unknown): EvidenceConsistency {
  if (typeof value !== "string") return "INCONCLUSIVE";
  const upper = value.trim().toUpperCase() as EvidenceConsistency;
  return EVIDENCE_VALUES.has(upper) ? upper : "INCONCLUSIVE";
}

function normalizeDepartment(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    return DEPARTMENT_NAMES.roads;
  }
  const trimmed = value.trim();
  if (DEPARTMENT_NAMES_SET.has(trimmed)) return trimmed;
  const slug = trimmed.toLowerCase().replace(/\s+/g, "");
  const fromSlug = DEPARTMENT_SLUGS.find(
    (item) => item === slug || DEPARTMENT_NAMES[item] === trimmed,
  );
  return fromSlug ? DEPARTMENT_NAMES[fromSlug] : DEPARTMENT_NAMES.roads;
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

export function parseClassificationOutput(raw: string): SimpleClassificationResult {
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

export function parseGeminiAnalysisOutput(raw: string): GeminiRawAnalysis {
  const parsed = extractJsonObject(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Gemini output was not a JSON object.");
  }

  const record = parsed as Record<string, unknown>;

  return {
    category: normalizeCategory(record.category),
    categoryConfidence: clampConfidence(Number(record.categoryConfidence ?? 0)),
    description: normalizeDescription(record.description),
    evidenceConsistency: normalizeEvidence(record.evidenceConsistency),
    evidenceConfidence: clampConfidence(Number(record.evidenceConfidence ?? 0)),
    evidenceReason:
      typeof record.evidenceReason === "string" && record.evidenceReason.trim()
        ? record.evidenceReason.trim().slice(0, 500)
        : "Insufficient detail for evidence review.",
    safetyRiskScore: clampScore(Number(record.safetyRiskScore ?? 0)),
    publicImpactScore: clampScore(Number(record.publicImpactScore ?? 0)),
    urgencyScore: clampScore(Number(record.urgencyScore ?? 0)),
    essentialServiceImpactScore: clampScore(
      Number(record.essentialServiceImpactScore ?? 0),
    ),
    infrastructureSeverityScore: clampScore(
      Number(record.infrastructureSeverityScore ?? 0),
    ),
    healthEnvironmentalRiskScore: clampScore(
      Number(record.healthEnvironmentalRiskScore ?? 0),
    ),
    civicImpactScore: clampScore(Number(record.civicImpactScore ?? 0)),
    priorityReason:
      typeof record.priorityReason === "string" && record.priorityReason.trim()
        ? record.priorityReason.trim().slice(0, 500)
        : "Civic impact assessment based on visible issue severity.",
    recommendedDepartment: normalizeDepartment(record.recommendedDepartment),
    recommendedAction:
      typeof record.recommendedAction === "string" && record.recommendedAction.trim()
        ? record.recommendedAction.trim().slice(0, 120)
        : "STANDARD_ROUTING",
  };
}
