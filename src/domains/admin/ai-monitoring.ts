import { prisma } from "@/lib/db";

export async function getAiMonitoringStats() {
  const [
    total,
    success,
    failures,
    manualFallbacks,
    p1,
    p2,
    p3,
    p4,
    needsReview,
    mismatches,
    recent,
  ] = await Promise.all([
    prisma.aiClassificationLog.count(),
    prisma.aiClassificationLog.count({ where: { status: "SUCCESS" } }),
    prisma.aiClassificationLog.count({ where: { status: "FAILURE" } }),
    prisma.aiClassificationLog.count({ where: { status: "MANUAL_FALLBACK" } }),
    prisma.aiClassificationLog.count({ where: { priority: "P1" } }),
    prisma.aiClassificationLog.count({ where: { priority: "P2" } }),
    prisma.aiClassificationLog.count({ where: { priority: "P3" } }),
    prisma.aiClassificationLog.count({ where: { priority: "P4" } }),
    prisma.aiClassificationLog.count({ where: { requiresManualReview: true } }),
    prisma.aiClassificationLog.count({
      where: { evidenceConsistency: "POTENTIAL_MISMATCH" },
    }),
    prisma.aiClassificationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        requestId: true,
        createdAt: true,
        provider: true,
        model: true,
        status: true,
        category: true,
        categoryConfidence: true,
        evidenceConsistency: true,
        evidenceConfidence: true,
        priority: true,
        priorityScore: true,
        civicImpactScore: true,
        recommendedDepartment: true,
        requiresManualReview: true,
        totalMs: true,
      },
    }),
  ]);

  return {
    total,
    success,
    failures,
    manualFallbacks,
    p1,
    p2,
    p3,
    p4,
    needsReview,
    mismatches,
    recent,
  };
}
