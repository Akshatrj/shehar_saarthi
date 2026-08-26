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
        action: "AI_CLASSIFIED",
        oldStatus: "SUBMITTED",
        newStatus: "SUBMITTED",
        metadata: null,
        createdAt: "2026-01-01T10:05:00.000Z",
      },
      {
        id: "2b",
        action: "ROUTING_RECOMMENDED",
        oldStatus: "SUBMITTED",
        newStatus: "SUBMITTED",
        metadata: null,
        createdAt: "2026-01-01T10:06:00.000Z",
      },
      {
        id: "3",
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
        id: "4",
        action: "ASSIGNED_TO_SELF",
        oldStatus: "ROUTED",
        newStatus: "ASSIGNED",
        metadata: null,
        createdAt: "2026-01-01T12:00:00.000Z",
      },
      {
        id: "5",
        action: "STARTED_PROGRESS",
        oldStatus: "ASSIGNED",
        newStatus: "IN_PROGRESS",
        metadata: null,
        createdAt: "2026-01-01T13:00:00.000Z",
      },
      {
        id: "6",
        action: "MARKED_COMPLETED",
        oldStatus: "IN_PROGRESS",
        newStatus: "COMPLETED",
        metadata: null,
        createdAt: "2026-01-01T14:00:00.000Z",
      },
      {
        id: "7",
        action: "REOPENED_BY_CITIZEN",
        oldStatus: "COMPLETED",
        newStatus: "ASSIGNED",
        metadata: JSON.stringify({
          reason: "The pothole was only filled on one side.",
        }),
        createdAt: "2026-01-01T15:00:00.000Z",
      },
    ],
    aiCategory: "POTHOLE",
    aiDescription: "Large damaged area of road is visible.",
  });

  assert.equal(timeline[0]?.label, "Reopened");
  assert.equal(
    timeline[0]?.detail,
    "The pothole was only filled on one side.",
  );
  assert.equal(timeline[1]?.label, "Worker assigned");
  assert.deepEqual(
    timeline.map((item) => item.label),
    ["Reopened", "Worker assigned"],
  );
}

function testFullCycleTimeline() {
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
        action: "MANUALLY_ROUTED",
        oldStatus: "SUBMITTED",
        newStatus: "ROUTED",
        metadata: null,
        createdAt: "2026-01-01T11:00:00.000Z",
      },
      {
        id: "3",
        action: "ASSIGNED_TO_WORKER",
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
        action: "CLOSED",
        oldStatus: "COMPLETED",
        newStatus: "CLOSED",
        metadata: null,
        createdAt: "2026-01-01T14:00:00.000Z",
      },
    ],
    aiCategory: null,
    aiDescription: null,
  });

  assert.deepEqual(timeline.map((item) => item.label), [
    "Complaint submitted",
    "Complaint verified",
    "In progress with department",
    "Worker assigned",
    "Worker is ready for job",
    "Complaint closed",
  ]);
}

testTimeline();
testFullCycleTimeline();
console.log("phase7 citizen tracking tests passed");
