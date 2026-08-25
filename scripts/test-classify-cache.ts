import assert from "node:assert/strict";
import {
  hasAiAttempt,
  hasCompletedAiAnalysis,
} from "@/domains/complaints/classify-cache";

function testClassifyCache() {
  const complete = {
    aiRequestId: "REQ-2026-ABC123",
    aiCategory: "POTHOLE",
  };
  assert.equal(hasCompletedAiAnalysis(complete as never), true);
  assert.equal(hasAiAttempt(complete as never), true);

  const attempted = {
    aiRequestId: "REQ-2026-ABC123",
    aiCategory: null,
  };
  assert.equal(hasCompletedAiAnalysis(attempted as never), false);
  assert.equal(hasAiAttempt(attempted as never), true);

  const fresh = {
    aiRequestId: null,
    aiCategory: null,
  };
  assert.equal(hasCompletedAiAnalysis(fresh as never), false);
  assert.equal(hasAiAttempt(fresh as never), false);
}

testClassifyCache();
console.log("classify cache tests passed");
