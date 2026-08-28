import assert from "node:assert/strict";
import { rankDepartmentsForComplaint } from "@/domains/routing/engine";

const baseDepartment = {
  isActive: true,
  workloadScore: 0,
};

function testCategoryRoutesToConfiguredDepartment() {
  const lightsId = "11111111-1111-4111-8111-111111111111";
  const pavingId = "22222222-2222-4222-8222-222222222222";
  const result = rankDepartmentsForComplaint({
    category: "BROKEN_STREETLIGHT",
    primaryDepartmentId: lightsId,
    departments: [
      {
        id: lightsId,
        name: "Lighting Desk",
        code: "lights",
        ...baseDepartment,
        supportedCategories: ["BROKEN_STREETLIGHT"],
      },
      {
        id: pavingId,
        name: "Paving Desk",
        code: "paving",
        ...baseDepartment,
        supportedCategories: ["POTHOLE"],
      },
    ],
  });

  assert.equal(result.recommendedDepartmentId, lightsId);
  assert.ok(result.ranked[0]?.recommended);
  assert.equal(result.distanceKm, null);
}

function testInactiveExcluded() {
  const result = rankDepartmentsForComplaint({
    category: "GARBAGE",
    primaryDepartmentId: "33333333-3333-4333-8333-333333333333",
    departments: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        name: "Waste Desk",
        code: "waste",
        isActive: false,
        workloadScore: 0,
        supportedCategories: ["GARBAGE"],
      },
    ],
  });

  assert.equal(result.recommendedDepartmentId, null);
  assert.match(result.reason, /No active department is configured/i);
}

function testLowerWorkloadPreferred() {
  const busyId = "44444444-4444-4444-8444-444444444444";
  const lightId = "55555555-5555-4555-8555-555555555555";
  const result = rankDepartmentsForComplaint({
    category: "OTHER",
    departments: [
      {
        id: busyId,
        name: "Busy Desk",
        code: "busy",
        isActive: true,
        workloadScore: 40,
        supportedCategories: ["OTHER"],
      },
      {
        id: lightId,
        name: "Light Desk",
        code: "light",
        isActive: true,
        workloadScore: 5,
        supportedCategories: ["OTHER"],
      },
    ],
  });

  assert.equal(result.recommendedDepartmentId, lightId);
}

testCategoryRoutesToConfiguredDepartment();
testInactiveExcluded();
testLowerWorkloadPreferred();
console.log("routing engine tests passed");
