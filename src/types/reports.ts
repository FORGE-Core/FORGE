export type EnrichedInclusionReport = {
  averageScore: number;
  auditCount: number;
  belowThreshold?: number;
  policy?: { minAcceptableScore: number };
  lowest: {
    targetType: string;
    targetId: string;
    title: string;
    score: number;
    issues: string[];
  }[];
  recommendations: string[];
  complexModules?: {
    targetId: string;
    title: string;
    score: number;
    issues: string[];
    recommendations: string[];
  }[];
};
