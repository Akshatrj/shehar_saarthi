import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { config } from "dotenv";
import { isGeminiConfigured, getGeminiModel } from "@/domains/ai/config";
import { analyzeComplaintWithGemini, parseGeminiRawOutput } from "@/domains/ai/gemini";
import { getCivicContextSummary } from "@/domains/ai/context";
import { getHistoricalTrendSummary } from "@/domains/ai/trends";

config({ path: ".env.local" });

async function main() {
  if (!isGeminiConfigured()) {
    console.error("FAIL: GEMINI_API_KEY is not set in .env.local");
    process.exit(1);
  }

  const imagePath = join(process.cwd(), "public", "brand", "shehar-saarthi-logo.jpg");
  const bytes = await readFile(imagePath);

  const image = {
    bytes,
    mimeType: "image/jpeg" as const,
    width: 320,
    height: 360,
    wasOptimized: false,
  };

  const [trends, context] = await Promise.all([
    getHistoricalTrendSummary({
      category: "POTHOLE",
      latitude: 28.6139,
      longitude: 77.209,
    }),
    getCivicContextSummary(),
  ]);

  const started = Date.now();
  const { raw, model } = await analyzeComplaintWithGemini({
    image,
    description: "Large pothole on the main road near the market causing traffic issues.",
    citizenCategory: "POTHOLE",
    locationLabel: "Connaught Place, New Delhi",
    latitude: 28.6139,
    longitude: 77.209,
    trends,
    context,
  });

  let parsed;
  try {
    parsed = parseGeminiRawOutput(raw);
  } catch (error) {
    console.error("FAIL: Could not parse Gemini JSON output");
    console.error(`  raw preview: ${raw.slice(0, 400).replace(/\s+/g, " ")}`);
    throw error;
  }
  const elapsed = Date.now() - started;

  console.log("PASS: Live Gemini request succeeded");
  console.log(`  model: ${model || getGeminiModel()}`);
  console.log(`  latency: ${elapsed}ms`);
  console.log(`  category: ${parsed.category}`);
  console.log(`  categoryConfidence: ${parsed.categoryConfidence}`);
  console.log(`  evidenceConsistency: ${parsed.evidenceConsistency}`);
  console.log(`  civicImpactScore: ${parsed.civicImpactScore}`);
  console.log(`  description: ${parsed.description.slice(0, 120)}${parsed.description.length > 120 ? "…" : ""}`);
}

main().catch((error) => {
  console.error("FAIL: Live Gemini test failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
