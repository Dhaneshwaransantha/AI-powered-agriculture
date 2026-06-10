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
public class CropAnalysisResponse {

    private Long id;
    private String imageName;
    private String imagePath;
    private String farmerName;
    private String location;

    // Crop Info
    private String cropName;
    private String cropVariety;
    private String confidenceLevel;

    // Growth
    private String growthStage;
    private Integer growthPercentage;
    private Integer daysToHarvest;
    private String estimatedHarvestDate;
    private String overallHealth;

    // Disease
    private Boolean hasDisease;
    private String diseaseName;
    private String diseaseSeverity;
    private String diseaseDescription;
    private List<String> treatmentMethods;
    private List<String> preventiveMeasures;

    // Inputs Required
    private String waterRequirement;
    private List<String> fertilizerRequirement;
    private List<String> pesticideRequirement;

    // Deficiency
    private Boolean hasDeficiency;
    private List<String> deficiencyType;
    private List<String> deficiencyTreatment;

    private List<String> generalRecommendations;

    // Status
    private String status;
    private String message;
    private LocalDateTime analysedAt;
}
