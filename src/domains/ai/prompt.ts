import { COMPLAINT_CATEGORY_LABELS } from "@/domains/complaints/types";
import type { CivicContextSummary, HistoricalTrendSummary } from "@/domains/ai/types";

export function buildGeminiAnalysisPrompt(input: {
  description: string;
  citizenCategory: string | null;
  locationLabel: string | null;
  latitude: number;
  longitude: number;
  trends: HistoricalTrendSummary;
  context: CivicContextSummary;
}) {
  const categoryOptions = Object.entries(COMPLAINT_CATEGORY_LABELS)
    .map(([key, label]) => `${key} (${label})`)
    .join("\n");

  return `Analyze this civic complaint for Shehar Saarthi.

Citizen description: ${input.description}
Citizen-selected category: ${input.citizenCategory ?? "Not provided"}
Location: ${input.locationLabel ?? `${input.latitude}, ${input.longitude}`}

Historical trend summary (from database, do not invent numbers):
${input.trends.summary}

Current civic context (external signal, do not invent news):
${input.context.summary}

Choose exactly one category from:
${categoryOptions}

Return compact JSON only with these keys:
category, categoryConfidence, description, evidenceConsistency, evidenceConfidence, evidenceReason,
safetyRiskScore, publicImpactScore, urgencyScore, essentialServiceImpactScore,
infrastructureSeverityScore, healthEnvironmentalRiskScore, civicImpactScore,
priorityReason, recommendedAction

Rules:
- category must be one of the enum keys above
- evidenceConsistency: CONSISTENT | POTENTIAL_MISMATCH | NEEDS_REVIEW | INCONCLUSIVE
- scores are integers 0-100
- categoryConfidence and evidenceConfidence are 0-1 decimals
- recommendedAction: STANDARD_ROUTING or PRIORITY_ROUTING or NEEDS_REVIEW
- Do not assign a municipal department. Routing is configured separately.
- Keep description to one concise sentence
- Do not invent statistics or news beyond the summaries provided`;
}

export const GEMINI_SYSTEM_INSTRUCTION =
  "You assist a civic complaint management system. Return valid JSON only. Be concise. Do not include chain-of-thought.";
