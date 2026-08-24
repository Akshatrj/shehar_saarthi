import {
  CLASSIFICATION_SYSTEM_PROMPT,
  CLASSIFICATION_USER_PROMPT,
} from "@/domains/ai/prompt";
import { parseClassificationOutput } from "@/domains/ai/parse";
import type { ClassificationResult } from "@/domains/ai/parse";

const HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";
const DEFAULT_VISION_MODEL = "Qwen/Qwen2.5-VL-7B-Instruct";
const CLASSIFICATION_TIMEOUT_MS = 25_000;

export class ClassificationProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClassificationProviderError";
  }
}

function getApiKey() {
  const key =
    process.env.HUGGINGFACE_API_KEY?.trim() ||
    process.env.HF_TOKEN?.trim() ||
    "";
  if (!key) {
    throw new ClassificationProviderError(
      "Hugging Face API key is not configured on the server.",
    );
  }
  return key;
}

function getVisionModel() {
  return (
    process.env.HF_VISION_MODEL?.trim() ||
    process.env.HUGGINGFACE_VISION_MODEL?.trim() ||
    DEFAULT_VISION_MODEL
  );
}

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

function messageContentToText(
  content: string | Array<{ type?: string; text?: string }> | undefined,
) {
  if (!content) {
    return "";
  }
  if (typeof content === "string") {
    return content;
  }
  return content
    .map((part) => (part.type === "text" ? part.text ?? "" : ""))
    .join("")
    .trim();
}

export async function classifyComplaintImage(
  imageUrl: string,
): Promise<ClassificationResult> {
  const apiKey = getApiKey();
  const model = getVisionModel();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLASSIFICATION_TIMEOUT_MS);

  try {
    const response = await fetch(HF_ROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 256,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: CLASSIFICATION_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: [
              { type: "text", text: CLASSIFICATION_USER_PROMPT },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });

    const payload = (await response.json()) as ChatCompletionResponse;

    if (!response.ok) {
      const message =
        payload.error?.message ??
        `Hugging Face request failed with status ${response.status}.`;
      throw new ClassificationProviderError(message);
    }

    const raw = messageContentToText(payload.choices?.[0]?.message?.content);
    if (!raw) {
      throw new ClassificationProviderError("Hugging Face returned empty output.");
    }

    return parseClassificationOutput(raw);
  } catch (error) {
    if (error instanceof ClassificationProviderError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new ClassificationProviderError("Hugging Face request timed out.");
    }
    throw new ClassificationProviderError(
      "Could not reach Hugging Face Inference Providers.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
