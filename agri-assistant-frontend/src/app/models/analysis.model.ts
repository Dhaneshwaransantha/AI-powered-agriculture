export interface SoilAnalysisResponse {
  id?: number;
  imageName?: string;
  imagePath?: string;
  farmerName?: string;
  location?: string;
  texture?: string;
  colorDescription?: string;
  moistureLevel?: string;
  organicMatter?: string;
  fertilityLevel?: string;
  phEstimate?: string;
  isSuitableForCultivation?: boolean;
  suitabilityScore?: number;
  suitabilityReason?: string;
  recommendedFertilizers?: string[];
  recommendedNutrients?: string[];
  organicImprovements?: string[];
  suitableCrops?: string[];
  generalRecommendations?: string[];
  status?: string;
  message?: string;
  analysedAt?: string;
}

export interface CropAnalysisResponse {
  id?: number;
  imageName?: string;
  imagePath?: string;
  farmerName?: string;
  location?: string;
  cropName?: string;
  cropVariety?: string;
  confidenceLevel?: string;
  growthStage?: string;
  growthPercentage?: number;
  daysToHarvest?: number;
  estimatedHarvestDate?: string;
  overallHealth?: string;
  hasDisease?: boolean;
  diseaseName?: string;
  diseaseSeverity?: string;
  diseaseDescription?: string;
  treatmentMethods?: string[];
  preventiveMeasures?: string[];
  waterRequirement?: string;
  fertilizerRequirement?: string[];
  pesticideRequirement?: string[];
  hasDeficiency?: boolean;
  deficiencyType?: string[];
  deficiencyTreatment?: string[];
  generalRecommendations?: string[];
  status?: string;
  message?: string;
  analysedAt?: string;
}

export interface HistoryResponse {
  id?: number;
  analysisType?: string;
  referenceId?: number;
  farmerName?: string;
  location?: string;
  imageName?: string;
  imagePath?: string;
  summary?: string;
  resultStatus?: string;
  createdAt?: string;
}

export interface DashboardStats {
  totalSoilAnalyses?: number;
  totalCropAnalyses?: number;
  suitableSoilCount?: number;
  nonSuitableSoilCount?: number;
  diseasedCropCount?: number;
  deficientCropCount?: number;
  totalAnalyses?: number;
}
