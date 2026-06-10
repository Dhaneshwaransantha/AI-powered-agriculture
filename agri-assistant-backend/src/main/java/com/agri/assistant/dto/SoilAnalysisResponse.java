package com.agri.assistant.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoilAnalysisResponse {

    private Long id;
    private String imageName;
    private String imagePath;
    private String farmerName;
    private String location;

    // Soil Quality
    private String texture;
    private String colorDescription;
    private String moistureLevel;
    private String organicMatter;
    private String fertilityLevel;
    private String phEstimate;

    // Cultivation Suitability
    private Boolean isSuitableForCultivation;
    private Integer suitabilityScore;
    private String suitabilityReason;

    // Recommendations
    private List<String> recommendedFertilizers;
    private List<String> recommendedNutrients;
    private List<String> organicImprovements;
    private List<String> suitableCrops;
    private List<String> generalRecommendations;

    // Status
    private String status;
    private String message;
    private LocalDateTime analysedAt;
}
