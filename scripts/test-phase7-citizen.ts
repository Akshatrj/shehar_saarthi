import assert from "node:assert/strict";
import { buildCitizenTimeline } from "@/domains/complaints/timeline";

function testTimeline() {
  const timeline = buildCitizenTimeline({
    history: [
      {
        id: "1",
        action: "SUBMITTED",
        oldStatus: null,
        newStatus: "SUBMITTED",
        metadata: null,
        createdAt: "2026-01-01T10:00:00.000Z",
      },
      {
        id: "2",
        action: "CATEGORY_CONFIRMED",
        oldStatus: "SUBMITTED",
        newStatus: "ROUTED",
        metadata: JSON.stringify({
          category: "POTHOLE",
          routingMethod: "AI_CONFIRMED",
          departmentCode: "roads",
        }),
        createdAt: "2026-01-01T11:00:00.000Z",
      },
      {
        id: "3",
        action: "ASSIGNED_TO_SELF",
        oldStatus: "ROUTED",
        newStatus: "ASSIGNED",
        metadata: null,
        createdAt: "2026-01-01T12:00:00.000Z",
      },
      {
        id: "4",
        action: "STARTED_PROGRESS",
        oldStatus: "ASSIGNED",
        newStatus: "IN_PROGRESS",
        metadata: null,
        createdAt: "2026-01-01T13:00:00.000Z",
      },
      {
        id: "5",
        action: "MARKED_COMPLETED",
        oldStatus: "IN_PROGRESS",
        newStatus: "COMPLETED",
        metadata: null,
        createdAt: "2026-01-01T14:00:00.000Z",
      },
    ],
    aiCategory: "POTHOLE",
    aiDescription: "Large damaged area of road is visible.",
  });

  assert.equal(timeline[0]?.label, "Complaint submitted");
  assert.equal(timeline[1]?.label, "AI category suggested");
  assert.equal(timeline[2]?.label, "Category confirmed");
  assert.equal(timeline[3]?.label, "Routed to Roads");
  assert.equal(timeline[4]?.label, "Assigned to worker");
  assert.equal(timeline[5]?.label, "Work started");
  assert.equal(timeline[6]?.label, "Completed");
}

testTimeline();
console.log("phase7 citizen tracking tests passed");
