import assert from "node:assert/strict";
import {
  assertValidTransition,
  canTransition,
  ComplaintTransitionError,
} from "@/domains/complaints/transitions";

function testAllowedTransitions() {
  assert.equal(canTransition("SUBMITTED", "ROUTED"), true);
  assert.equal(canTransition("ROUTED", "ASSIGNED"), true);
  assert.equal(canTransition("ASSIGNED", "IN_PROGRESS"), true);
  assert.equal(canTransition("IN_PROGRESS", "COMPLETED"), true);
  assert.equal(canTransition("COMPLETED", "CLOSED"), true);
}

function testBlockedTransitions() {
  assert.throws(
    () => assertValidTransition("SUBMITTED", "ASSIGNED"),
    ComplaintTransitionError,
  );
  assert.throws(
    () => assertValidTransition("ROUTED", "COMPLETED"),
    ComplaintTransitionError,
  );
  assert.throws(
    () => assertValidTransition("CLOSED", "SUBMITTED"),
    ComplaintTransitionError,
  );
}

testAllowedTransitions();
testBlockedTransitions();
console.log("phase9 transition tests passed");
