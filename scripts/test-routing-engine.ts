import assert from "node:assert/strict";
import { rankDepartmentsForComplaint } from "@/domains/routing/engine";

const baseDepartment = {
  isActive: true,
  workloadScore: 0,
};

function testCategoryRoutesToPrimaryDepartment() {
  const result = rankDepartmentsForComplaint({
    category: "BROKEN_STREETLIGHT",
    departments: [
      {
        id: "electrical",
        name: "Electrical",
        code: "electrical",
        ...baseDepartment,
        supportedCategories: ["BROKEN_STREETLIGHT"],
      },
      {
        id: "roads",
        name: "Roads",
        code: "roads",
        ...baseDepartment,
        supportedCategories: ["POTHOLE"],
      },
    ],
  });

  assert.equal(result.recommendedDepartmentCode, "electrical");
  assert.ok(result.ranked[0]?.recommended);
  assert.equal(result.distanceKm, null);
}

function testInactiveExcluded() {
  const result = rankDepartmentsForComplaint({
    category: "GARBAGE",
    departments: [
      {
        id: "inactive",
        name: "Sanitation",
        code: "sanitation",
        isActive: false,
        workloadScore: 0,
        supportedCategories: ["GARBAGE"],
      },
    ],
  });

  assert.equal(result.recommendedDepartmentId, null);
  assert.match(result.reason, /No active department matched routing rules/i);
}

function testLowerWorkloadPreferred() {
  const result = rankDepartmentsForComplaint({
    category: "OTHER",
    departments: [
      {
        id: "parks-busy",
        name: "Parks",
        code: "parks",
        isActive: true,
        workloadScore: 40,
        supportedCategories: ["OTHER"],
      },
      {
        id: "custom-light",
        name: "Custom Services",
        code: "custom",
        isActive: true,
        workloadScore: 5,
        supportedCategories: ["OTHER"],
      },
    ],
  });

  assert.equal(result.recommendedDepartmentId, "custom-light");
}

testCategoryRoutesToPrimaryDepartment();
testInactiveExcluded();
testLowerWorkloadPreferred();
console.log("routing engine tests passed");
