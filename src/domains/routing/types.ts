export type RankedDepartmentRecommendation = {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  distanceKm: number | null;
  inJurisdiction: boolean | null;
  categoryMatch: boolean;
  workloadScore: number;
  score: number;
  reason: string;
  recommended: boolean;
};

export type RoutingRecommendationResult = {
  category: string;
  serviceType: string;
  confidence: number;
  recommendedDepartmentId: string | null;
  recommendedDepartmentName: string | null;
  recommendedDepartmentCode: string | null;
  distanceKm: number | null;
  reason: string;
  ranked: RankedDepartmentRecommendation[];
  locationAvailable: boolean;
};
