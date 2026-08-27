function readNumber(name: string, fallback: number) {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim() ?? "";
}

export function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";
}

export function getGeminiTimeoutMs() {
  return readNumber("GEMINI_TIMEOUT_MS", 25_000);
}

export function getAiConfidenceThreshold() {
  return readNumber("AI_CONFIDENCE_THRESHOLD", 0.7);
}

export function getEvidenceReviewThreshold() {
  return readNumber("EVIDENCE_REVIEW_THRESHOLD", 0.6);
}

export function getPriorityThresholds() {
  return {
    p1: readNumber("AI_PRIORITY_P1_THRESHOLD", 90),
    p2: readNumber("AI_PRIORITY_P2_THRESHOLD", 70),
    p3: readNumber("AI_PRIORITY_P3_THRESHOLD", 40),
  };
}

export function getPriorityWeights() {
  return {
    current: readNumber("AI_PRIORITY_CURRENT_WEIGHT", 0.4),
    safety: readNumber("AI_PRIORITY_SAFETY_WEIGHT", 0.25),
    impact: readNumber("AI_PRIORITY_IMPACT_WEIGHT", 0.15),
    trend: readNumber("AI_PRIORITY_TREND_WEIGHT", 0.1),
    recurring: readNumber("AI_PRIORITY_RECURRING_WEIGHT", 0.05),
    context: readNumber("AI_PRIORITY_CONTEXT_WEIGHT", 0.05),
  };
}

export function isGeminiConfigured() {
  return getGeminiApiKey().length > 0;
}

export function createClassificationRequestId() {
  const year = new Date().getUTCFullYear();
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `REQ-${year}-${suffix}`;
}
