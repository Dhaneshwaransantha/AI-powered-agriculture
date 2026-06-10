package com.agri.assistant.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "soil_analyses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoilAnalysis {

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

    // Soil Quality Factors
    @Column(name = "texture", length = 100)
    private String texture;

    @Column(name = "color_description", length = 200)
    private String colorDescription;

    @Column(name = "moisture_level", length = 100)
    private String moistureLevel;

    @Column(name = "organic_matter", length = 100)
    private String organicMatter;

    @Column(name = "fertility_level", length = 100)
    private String fertilityLevel;

    @Column(name = "ph_estimate", length = 50)
    private String phEstimate;

    // Cultivation Suitability
    @Column(name = "is_suitable_for_cultivation")
    private Boolean isSuitableForCultivation;

    @Column(name = "suitability_score")
    private Integer suitabilityScore; // 0-100

    @Column(name = "suitability_reason", columnDefinition = "TEXT")
    private String suitabilityReason;

    // Recommendations
    @Column(name = "recommended_fertilizers", columnDefinition = "TEXT")
    private String recommendedFertilizers;

    @Column(name = "recommended_nutrients", columnDefinition = "TEXT")
    private String recommendedNutrients;

    @Column(name = "organic_improvements", columnDefinition = "TEXT")
    private String organicImprovements;

    @Column(name = "suitable_crops", columnDefinition = "TEXT")
    private String suitableCrops;

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
