import assert from "node:assert/strict";
import { buildCitizenTimeline } from "@/domains/complaints/timeline";

function testTimeline() {
  const timeline = buildCitizenTimeline({
    history: [
      {
        id: "1",
        action: "SUBMITTED",
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: null,
        createdAt: "2026-01-01T10:00:00.000Z",
      },
      {
        id: "2",
        action: "CATEGORY_CONFIRMED",
        fromStatus: "SUBMITTED",
        toStatus: "ROUTED",
        note: JSON.stringify({
          category: "POTHOLE",
          routingMethod: "AI_CONFIRMED",
          departmentSlug: "roads",
        }),
        createdAt: "2026-01-01T11:00:00.000Z",
      },
      {
        id: "3",
        action: "ASSIGNED_TO_SELF",
        fromStatus: "ROUTED",
        toStatus: "ASSIGNED",
        note: null,
        createdAt: "2026-01-01T12:00:00.000Z",
      },
      {
        id: "4",
        action: "STARTED_PROGRESS",
        fromStatus: "ASSIGNED",
        toStatus: "IN_PROGRESS",
        note: null,
        createdAt: "2026-01-01T13:00:00.000Z",
      },
      {
        id: "5",
        action: "MARKED_COMPLETED",
        fromStatus: "IN_PROGRESS",
        toStatus: "COMPLETED",
        note: null,
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
  assert.equal(timeline[4]?.label, "Assigned to staff");
  assert.equal(timeline[5]?.label, "Work started");
  assert.equal(timeline[6]?.label, "Completed");
}

testTimeline();
console.log("phase7 citizen tracking tests passed");
