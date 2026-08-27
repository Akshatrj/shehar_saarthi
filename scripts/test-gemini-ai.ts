import assert from "node:assert/strict";
import { parseClassificationOutput, parseGeminiAnalysisOutput } from "@/domains/ai/parse";
import { validateClassifyImageUrl } from "@/domains/ai/access";
import {
  calculatePriorityScore,
  priorityFromScore,
  requiresManualReview,
} from "@/domains/ai/priority";
import { isGeminiConfigured } from "@/domains/ai/config";

function assertThrows(fn: () => unknown, messageIncludes: string) {
  try {
    fn();
    assert.fail("Expected error");
  } catch (error) {
    assert.ok(error instanceof Error);
    assert.match(error.message, new RegExp(messageIncludes, "i"));
  }
}

function testParse() {
  const valid = parseClassificationOutput(
    '{"category":"POTHOLE","description":"A deep pothole is visible in the road surface."}',
  );
  assert.equal(valid.category, "POTHOLE");

  const full = parseGeminiAnalysisOutput(
    JSON.stringify({
      category: "GARBAGE",
      categoryConfidence: 0.91,
      description: "Overflowing waste on sidewalk.",
      evidenceConsistency: "CONSISTENT",
      evidenceConfidence: 0.88,
      evidenceReason: "Image matches description.",
      safetyRiskScore: 20,
      publicImpactScore: 70,
      urgencyScore: 55,
      essentialServiceImpactScore: 10,
      infrastructureSeverityScore: 40,
      healthEnvironmentalRiskScore: 65,
      civicImpactScore: 72,
      priorityReason: "Sanitation risk in public area.",
      recommendedDepartment: "Sanitation",
      recommendedAction: "STANDARD_ROUTING",
    }),
  );
  assert.equal(full.category, "GARBAGE");
  assert.equal(full.evidenceConsistency, "CONSISTENT");

  const invalidCategory = parseClassificationOutput(
    '{"category":"ALIEN_INVASION","description":"Something unclear."}',
  );
  assert.equal(invalidCategory.category, "OTHER");
}

function testPriority() {
  const score = calculatePriorityScore({
    safetyRiskScore: 80,
    publicImpactScore: 70,
    urgencyScore: 75,
    infrastructureSeverityScore: 65,
    civicImpactScore: 72,
    historicalTrendScore: 60,
    currentContextScore: 30,
    recurringProblem: true,
  });
  assert.ok(score >= 40 && score <= 100);
  assert.equal(priorityFromScore(92), "P1");
  assert.equal(priorityFromScore(75), "P2");
  assert.equal(requiresManualReview({
    categoryConfidence: 0.5,
    evidenceConfidence: 0.9,
    evidenceConsistency: "CONSISTENT",
  }), true);
  assert.equal(requiresManualReview({
    categoryConfidence: 0.9,
    evidenceConfidence: 0.9,
    evidenceConsistency: "POTENTIAL_MISMATCH",
  }), true);
}

function testImageUrlAccess() {
  const url = validateClassifyImageUrl(
    "https://abc.public.blob.vercel-storage.com/complaints/user/photo.png",
  );
  assert.match(url, /blob\.vercel-storage\.com/);
  assertThrows(() => validateClassifyImageUrl("https://evil.example/photo.jpg"), "allowed");
}

function testGeminiConfigPresence() {
  assert.equal(typeof isGeminiConfigured(), "boolean");
}

testParse();
testPriority();
testImageUrlAccess();
testGeminiConfigPresence();
console.log("gemini ai tests passed");
