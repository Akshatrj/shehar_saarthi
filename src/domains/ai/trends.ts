import { prisma } from "@/lib/db";
import type { ComplaintCategory } from "@/domains/complaints/types";
import type { HistoricalTrendSummary } from "@/domains/ai/types";

const TREND_RADIUS_KM = 1.5;

function trendScoreFromPercentage(trendPercentage: number | null): number | null {
  if (trendPercentage === null) return null;
  if (trendPercentage >= 100) return 85;
  if (trendPercentage >= 50) return 70;
  if (trendPercentage >= 20) return 55;
  if (trendPercentage > 0) return 40;
  return 25;
}

export async function getHistoricalTrendSummary(input: {
  category: ComplaintCategory | null;
  latitude: number;
  longitude: number;
}): Promise<HistoricalTrendSummary> {
  const now = new Date();
  const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const prev30Start = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const categoryFilter = input.category ? { category: input.category } : {};

  const [similarComplaintsLast30Days, similarComplaintsPrevious30Days, unresolvedRelatedCount, nearbyLast30] =
    await Promise.all([
      prisma.complaint.count({
        where: {
          ...categoryFilter,
          createdAt: { gte: last30Start },
        },
      }),
      prisma.complaint.count({
        where: {
          ...categoryFilter,
          createdAt: { gte: prev30Start, lt: last30Start },
        },
      }),
      prisma.complaint.count({
        where: {
          ...categoryFilter,
          status: { in: ["SUBMITTED", "ROUTED", "ASSIGNED", "IN_PROGRESS"] },
        },
      }),
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count
        FROM "complaints"
        WHERE "createdAt" >= ${last30Start}
          AND (
            6371 * acos(
              cos(radians(${input.latitude})) * cos(radians("latitude"::float8))
              * cos(radians("longitude"::float8) - radians(${input.longitude}))
              + sin(radians(${input.latitude})) * sin(radians("latitude"::float8))
            )
          ) <= ${TREND_RADIUS_KM}
      `,
    ]);

  const nearbyCount = Number(nearbyLast30[0]?.count ?? 0);
  const recurringProblem = nearbyCount >= 3;

  let trendPercentage: number | null = null;
  if (similarComplaintsPrevious30Days > 0) {
    trendPercentage = Math.round(
      ((similarComplaintsLast30Days - similarComplaintsPrevious30Days) /
        similarComplaintsPrevious30Days) *
        100,
    );
  } else if (similarComplaintsLast30Days > 0) {
    trendPercentage = 100;
  }

  const historicalTrendScore = trendScoreFromPercentage(trendPercentage);

  const summaryParts = [
    `Last 30 days: ${similarComplaintsLast30Days} similar complaints.`,
    similarComplaintsPrevious30Days > 0
      ? `Previous 30 days: ${similarComplaintsPrevious30Days} (${trendPercentage}% change).`
      : "Previous 30 days: insufficient baseline.",
    `Unresolved related: ${unresolvedRelatedCount}.`,
    recurringProblem ? "Recurring local issue detected." : "No strong local recurrence signal.",
  ];

  return {
    similarComplaintsLast30Days,
    similarComplaintsPrevious30Days,
    trendPercentage,
    unresolvedRelatedCount,
    recurringProblem,
    historicalTrendScore,
    summary: summaryParts.join(" "),
  };
}
