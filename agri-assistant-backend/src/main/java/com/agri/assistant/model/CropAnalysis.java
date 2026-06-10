package com.agri.assistant.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "crop_analyses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CropAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_path", nullable = false)
    private String imagePath;

    @Column(name = "image_name")
    private String imageName;

    @Column(name = "farmer_name")
    private String farmerName;

    @Column(name = "location")
    private String location;

    // Crop Identification
    @Column(name = "crop_name", length = 150)
    private String cropName;

    @Column(name = "crop_variety", length = 150)
    private String cropVariety;

    @Column(name = "confidence_level", length = 50)
    private String confidenceLevel;

    // Growth Analysis
    @Column(name = "growth_stage", length = 100)
    private String growthStage;

    @Column(name = "growth_percentage")
    private Integer growthPercentage; // 0-100

    @Column(name = "days_to_harvest")
    private Integer daysToHarvest;

    @Column(name = "estimated_harvest_date", length = 100)
    private String estimatedHarvestDate;

    @Column(name = "overall_health", length = 50)
    private String overallHealth; // Excellent, Good, Fair, Poor, Critical

    // Disease Detection
    @Column(name = "has_disease")
    private Boolean hasDisease;

    @Column(name = "disease_name", length = 200)
    private String diseaseName;

    @Column(name = "disease_severity", length = 50)
    private String diseaseSeverity; // Mild, Moderate, Severe

    @Column(name = "disease_description", columnDefinition = "TEXT")
    private String diseaseDescription;

    @Column(name = "treatment_methods", columnDefinition = "TEXT")
    private String treatmentMethods;

    @Column(name = "preventive_measures", columnDefinition = "TEXT")
    private String preventiveMeasures;

    // Required Inputs
    @Column(name = "water_requirement", columnDefinition = "TEXT")
    private String waterRequirement;

    @Column(name = "fertilizer_requirement", columnDefinition = "TEXT")
    private String fertilizerRequirement;

    @Column(name = "pesticide_requirement", columnDefinition = "TEXT")
    private String pesticideRequirement;

    // Deficiency Detection
    @Column(name = "has_deficiency")
    private Boolean hasDeficiency;

    @Column(name = "deficiency_type", columnDefinition = "TEXT")
    private String deficiencyType;

    @Column(name = "deficiency_treatment", columnDefinition = "TEXT")
    private String deficiencyTreatment;

    @Column(name = "general_recommendations", columnDefinition = "TEXT")
    private String generalRecommendations;

    // Raw AI Response
    @Column(name = "raw_ai_response", columnDefinition = "LONGTEXT")
    private String rawAiResponse;

    // Metadata
    @Column(name = "analysis_language", length = 20)
    private String analysisLanguage;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
