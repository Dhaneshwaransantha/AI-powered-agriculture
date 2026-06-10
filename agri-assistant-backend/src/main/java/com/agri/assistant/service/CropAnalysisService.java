package com.agri.assistant.service;

import com.agri.assistant.dto.CropAnalysisResponse;
import com.agri.assistant.model.AnalysisHistory;
import com.agri.assistant.model.CropAnalysis;
import com.agri.assistant.repository.AnalysisHistoryRepository;
import com.agri.assistant.repository.CropAnalysisRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CropAnalysisService {

    private final GeminiService geminiService;
    private final CropAnalysisRepository cropAnalysisRepository;
    private final AnalysisHistoryRepository historyRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    /**
     * Analyze crop image — uploads file, calls Gemini, parses, and persists
     */
    public CropAnalysisResponse analyzeCrop(MultipartFile imageFile, String farmerName, String location, String language) {
        log.info("Starting crop analysis for farmer: {}, location: {}", farmerName, location);

        try {
            // 1. Save uploaded image
            String savedPath = saveUploadedFile(imageFile, "crop");

            // 2. Read image bytes for Gemini
            byte[] imageBytes = imageFile.getBytes();
            String mimeType = imageFile.getContentType() != null ? imageFile.getContentType() : "image/jpeg";

            // 3. Call Gemini Vision API
            String rawResponse = geminiService.analyzeCropImage(imageBytes, mimeType, language);
            log.debug("Gemini crop analysis response received");

            // 4. Parse AI response
            CropAnalysis analysis = parseCropResponse(rawResponse, imageFile.getOriginalFilename(), savedPath, farmerName, location, language);
            analysis.setRawAiResponse(rawResponse);

            // 5. Save to database
            CropAnalysis saved = cropAnalysisRepository.save(analysis);
            log.info("Crop analysis saved with ID: {}", saved.getId());

            // 6. Record history
            saveHistory("CROP", saved.getId(), farmerName, location, imageFile.getOriginalFilename(), savedPath,
                    buildCropSummary(saved), "SUCCESS");

            // 7. Return response DTO
            return buildCropResponse(saved, "SUCCESS", "Crop analysis completed successfully");

        } catch (Exception e) {
            log.error("Crop analysis failed: {}", e.getMessage(), e);
            return CropAnalysisResponse.builder()
                    .status("ERROR")
                    .message("Crop analysis failed: " + e.getMessage())
                    .analysedAt(LocalDateTime.now())
                    .build();
        }
    }

    /**
     * Get crop analysis by ID (cached)
     */
    @Cacheable(value = "cropAnalysis", key = "#id")
    public CropAnalysisResponse getCropAnalysisById(Long id) {
        return cropAnalysisRepository.findById(id)
                .map(a -> buildCropResponse(a, "SUCCESS", "Found"))
                .orElse(CropAnalysisResponse.builder()
                        .status("NOT_FOUND")
                        .message("Crop analysis not found with ID: " + id)
                        .build());
    }

    /**
     * Get all crop analyses
     */
    public List<CropAnalysisResponse> getAllCropAnalyses() {
        return cropAnalysisRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(a -> buildCropResponse(a, "SUCCESS", "OK"))
                .toList();
    }

    // ================================================================
    // PRIVATE HELPERS
    // ================================================================

    private String saveUploadedFile(MultipartFile file, String subDir) throws IOException {
        Path uploadPath = Paths.get(uploadDir, subDir);
        Files.createDirectories(uploadPath);

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.write(filePath, file.getBytes());

        log.info("File saved: {}", filePath);
        return filePath.toString();
    }

    private CropAnalysis parseCropResponse(String jsonStr, String imageName, String imagePath,
                                            String farmerName, String location, String language) {
        try {
            JsonNode root = objectMapper.readTree(jsonStr);

            return CropAnalysis.builder()
                    .imageName(imageName)
                    .imagePath(imagePath)
                    .farmerName(farmerName != null ? farmerName : "Unknown")
                    .location(location != null ? location : "Unknown")
                    .cropName(getTextValue(root, "cropName"))
                    .cropVariety(getTextValue(root, "cropVariety"))
                    .confidenceLevel(getTextValue(root, "confidenceLevel"))
                    .growthStage(getTextValue(root, "growthStage"))
                    .growthPercentage(getIntValue(root, "growthPercentage"))
                    .daysToHarvest(getIntValue(root, "daysToHarvest"))
                    .estimatedHarvestDate(getTextValue(root, "estimatedHarvestDate"))
                    .overallHealth(getTextValue(root, "overallHealth"))
                    .hasDisease(getBoolValue(root, "hasDisease"))
                    .diseaseName(getTextValue(root, "diseaseName"))
                    .diseaseSeverity(getTextValue(root, "diseaseSeverity"))
                    .diseaseDescription(getTextValue(root, "diseaseDescription"))
                    .treatmentMethods(getArrayAsJson(root, "treatmentMethods"))
                    .preventiveMeasures(getArrayAsJson(root, "preventiveMeasures"))
                    .waterRequirement(getTextValue(root, "waterRequirement"))
                    .fertilizerRequirement(getArrayAsJson(root, "fertilizerRequirement"))
                    .pesticideRequirement(getArrayAsJson(root, "pesticideRequirement"))
                    .hasDeficiency(getBoolValue(root, "hasDeficiency"))
                    .deficiencyType(getArrayAsJson(root, "deficiencyType"))
                    .deficiencyTreatment(getArrayAsJson(root, "deficiencyTreatment"))
                    .generalRecommendations(getArrayAsJson(root, "generalRecommendations"))
                    .analysisLanguage(language != null ? language : "en")
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse crop response JSON: {}", e.getMessage());
            return CropAnalysis.builder()
                    .imageName(imageName)
                    .imagePath(imagePath)
                    .farmerName(farmerName)
                    .location(location)
                    .analysisLanguage(language)
                    .build();
        }
    }

    private CropAnalysisResponse buildCropResponse(CropAnalysis analysis, String status, String message) {
        return CropAnalysisResponse.builder()
                .id(analysis.getId())
                .imageName(analysis.getImageName())
                .imagePath(analysis.getImagePath())
                .farmerName(analysis.getFarmerName())
                .location(analysis.getLocation())
                .cropName(analysis.getCropName())
                .cropVariety(analysis.getCropVariety())
                .confidenceLevel(analysis.getConfidenceLevel())
                .growthStage(analysis.getGrowthStage())
                .growthPercentage(analysis.getGrowthPercentage())
                .daysToHarvest(analysis.getDaysToHarvest())
                .estimatedHarvestDate(analysis.getEstimatedHarvestDate())
                .overallHealth(analysis.getOverallHealth())
                .hasDisease(analysis.getHasDisease())
                .diseaseName(analysis.getDiseaseName())
                .diseaseSeverity(analysis.getDiseaseSeverity())
                .diseaseDescription(analysis.getDiseaseDescription())
                .treatmentMethods(parseJsonArray(analysis.getTreatmentMethods()))
                .preventiveMeasures(parseJsonArray(analysis.getPreventiveMeasures()))
                .waterRequirement(analysis.getWaterRequirement())
                .fertilizerRequirement(parseJsonArray(analysis.getFertilizerRequirement()))
                .pesticideRequirement(parseJsonArray(analysis.getPesticideRequirement()))
                .hasDeficiency(analysis.getHasDeficiency())
                .deficiencyType(parseJsonArray(analysis.getDeficiencyType()))
                .deficiencyTreatment(parseJsonArray(analysis.getDeficiencyTreatment()))
                .generalRecommendations(parseJsonArray(analysis.getGeneralRecommendations()))
                .status(status)
                .message(message)
                .analysedAt(analysis.getCreatedAt())
                .build();
    }

    private void saveHistory(String type, Long refId, String farmerName, String location,
                              String imageName, String imagePath, String summary, String resultStatus) {
        historyRepository.save(AnalysisHistory.builder()
                .analysisType(type)
                .referenceId(refId)
                .farmerName(farmerName)
                .location(location)
                .imageName(imageName)
                .imagePath(imagePath)
                .summary(summary)
                .resultStatus(resultStatus)
                .build());
    }

    private String buildCropSummary(CropAnalysis a) {
        return String.format("Crop: %s, Stage: %s, Health: %s, Disease: %s, Days to Harvest: %d",
                a.getCropName(), a.getGrowthStage(), a.getOverallHealth(),
                Boolean.TRUE.equals(a.getHasDisease()) ? a.getDiseaseName() : "None",
                a.getDaysToHarvest() != null ? a.getDaysToHarvest() : 0);
    }

    // JSON Helpers
    private String getTextValue(JsonNode node, String key) {
        JsonNode n = node.path(key);
        return n.isMissingNode() || n.isNull() ? null : n.asText();
    }

    private Boolean getBoolValue(JsonNode node, String key) {
        JsonNode n = node.path(key);
        return n.isMissingNode() || n.isNull() ? null : n.asBoolean();
    }

    private Integer getIntValue(JsonNode node, String key) {
        JsonNode n = node.path(key);
        return n.isMissingNode() || n.isNull() ? null : n.asInt();
    }

    private String getArrayAsJson(JsonNode node, String key) {
        try {
            JsonNode arr = node.path(key);
            if (arr.isMissingNode() || arr.isNull()) return "[]";
            return objectMapper.writeValueAsString(arr);
        } catch (Exception e) {
            return "[]";
        }
    }

    private List<String> parseJsonArray(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            JsonNode arr = objectMapper.readTree(json);
            List<String> result = new ArrayList<>();
            if (arr.isArray()) arr.forEach(n -> result.add(n.asText()));
            return result;
        } catch (Exception e) {
            return List.of();
        }
    }
}
