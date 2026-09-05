export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export interface AnalysisResult {
  fruitType: string;
  itemCount: number;
  avgDiameterMm: number;
  defectPercentage: number;
  colorScore: number; // 0-100, ripeness/uniformity
  sizeConsistencyScore: number; // 0-100
  grade: 'A' | 'B' | 'C';
  reasoning: string;
  defectsDetected: string[];
  colorProfile: { name: string; percentage: number }[]; // For histogram
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed';
}

export interface PriceEstimate {
  minPrice: number;
  maxPrice: number;
  currency: string;
  daysAnalyzed: number;
  gradeUsed: string;
  trend: 'up' | 'down' | 'stable';
}