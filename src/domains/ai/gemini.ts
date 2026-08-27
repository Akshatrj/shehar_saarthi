import {
  getGeminiApiKey,
  getGeminiModel,
  getGeminiTimeoutMs,
} from "@/domains/ai/config";
import { buildGeminiAnalysisPrompt, GEMINI_SYSTEM_INSTRUCTION } from "@/domains/ai/prompt";
import { parseGeminiAnalysisOutput } from "@/domains/ai/parse";
import type { CivicContextSummary, HistoricalTrendSummary } from "@/domains/ai/types";
import type { OptimizedImage } from "@/domains/ai/image-optimize";

export class ClassificationProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClassificationProviderError";
  }
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
};

function isRetryable(message: string, status?: number) {
  if (status === 401 || status === 403 || status === 400) return false;
  if (/api key|invalid|permission|unauthorized|forbidden/i.test(message)) {
    return false;
  }
  return /503|502|504|429|unavailable|timeout|temporarily/i.test(message);
}

async function callGeminiOnce(
  model: string,
  image: OptimizedImage,
  prompt: string,
  timeoutMs: number,
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new ClassificationProviderError("Gemini API key is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: GEMINI_SYSTEM_INSTRUCTION }],
        },
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 512,
          responseMimeType: "application/json",
        },
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: image.mimeType,
                  data: image.bytes.toString("base64"),
                },
              },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });

    const payload = (await response.json()) as GeminiResponse;
    if (!response.ok) {
      const message =
        payload.error?.message ?? `Gemini request failed with status ${response.status}.`;
      const error = new ClassificationProviderError(message);
      (error as ClassificationProviderError & { status?: number }).status =
        response.status;
      throw error;
    }

    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) {
      throw new ClassificationProviderError("Gemini returned empty output.");
    }

    return text;
  } catch (error) {
    if (error instanceof ClassificationProviderError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new ClassificationProviderError("Gemini request timed out.");
    }
    throw new ClassificationProviderError("Could not reach Google Gemini.");
  } finally {
    clearTimeout(timeout);
  }
}

export async function analyzeComplaintWithGemini(input: {
  image: OptimizedImage;
  description: string;
  citizenCategory: string | null;
  locationLabel: string | null;
  latitude: number;
  longitude: number;
  trends: HistoricalTrendSummary;
  context: CivicContextSummary;
}) {
  const model = getGeminiModel();
  const timeoutMs = getGeminiTimeoutMs();
  const prompt = buildGeminiAnalysisPrompt(input);

  try {
    const raw = await callGeminiOnce(model, input.image, prompt, timeoutMs);
    return { raw, model };
  } catch (error) {
    if (error instanceof ClassificationProviderError) {
      const status = (error as ClassificationProviderError & { status?: number })
        .status;
      if (
        isRetryable(error.message, status)
      ) {
        const raw = await callGeminiOnce(model, input.image, prompt, timeoutMs);
        return { raw, model };
      }
      throw error;
    }
    throw error;
  }
}

export function parseGeminiRawOutput(raw: string) {
  return parseGeminiAnalysisOutput(raw);
}
