package com.agri.assistant.service;

import com.agri.assistant.dto.SoilAnalysisResponse;
import com.agri.assistant.model.AnalysisHistory;
import com.agri.assistant.model.SoilAnalysis;
import com.agri.assistant.repository.AnalysisHistoryRepository;
import com.agri.assistant.repository.SoilAnalysisRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SoilAnalysisService {

    private final GeminiService geminiService;
    private final SoilAnalysisRepository soilAnalysisRepository;
    private final AnalysisHistoryRepository historyRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    /**
     * Analyze soil image — uploads file, calls Gemini, parses, and persists
     */
    public SoilAnalysisResponse analyzeSoil(MultipartFile imageFile, String farmerName, String location, String language) {
        log.info("Starting soil analysis for farmer: {}, location: {}", farmerName, location);

        try {
            // 1. Save uploaded image
            String savedPath = saveUploadedFile(imageFile, "soil");

            // 2. Read image bytes for Gemini API
            byte[] imageBytes = imageFile.getBytes();
            String mimeType = imageFile.getContentType() != null ? imageFile.getContentType() : "image/jpeg";

            // 3. Call Gemini Vision API
            String rawResponse = geminiService.analyzeSoilImage(imageBytes, mimeType, language);
            log.debug("Gemini soil analysis response received");

            // 4. Parse AI response
            SoilAnalysis analysis = parseSoilResponse(rawResponse, imageFile.getOriginalFilename(), savedPath, farmerName, location, language);
            analysis.setRawAiResponse(rawResponse);

            // 5. Save to database
            SoilAnalysis saved = soilAnalysisRepository.save(analysis);
            log.info("Soil analysis saved with ID: {}", saved.getId());

            // 6. Record history
            saveHistory("SOIL", saved.getId(), farmerName, location, imageFile.getOriginalFilename(), savedPath,
                    buildSoilSummary(saved), "SUCCESS");

            // 7. Build and return response DTO
            return buildSoilResponse(saved, "SUCCESS", "Soil analysis completed successfully");

        } catch (Exception e) {
            log.error("Soil analysis failed: {}", e.getMessage(), e);
            return SoilAnalysisResponse.builder()
                    .status("ERROR")
                    .message("Soil analysis failed: " + e.getMessage())
                    .analysedAt(LocalDateTime.now())
                    .build();
        }
    }

    /**
     * Get soil analysis by ID (cached)
     */
    @Cacheable(value = "soilAnalysis", key = "#id")
    public SoilAnalysisResponse getSoilAnalysisById(Long id) {
        return soilAnalysisRepository.findById(id)
                .map(a -> buildSoilResponse(a, "SUCCESS", "Found"))
                .orElse(SoilAnalysisResponse.builder()
                        .status("NOT_FOUND")
                        .message("Soil analysis not found with ID: " + id)
                        .build());
    }

    /**
     * Get all soil analyses
     */
    public List<SoilAnalysisResponse> getAllSoilAnalyses() {
        return soilAnalysisRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(a -> buildSoilResponse(a, "SUCCESS", "OK"))
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

    private SoilAnalysis parseSoilResponse(String jsonStr, String imageName, String imagePath,
                                            String farmerName, String location, String language) {
        try {
            JsonNode root = objectMapper.readTree(jsonStr);

            return SoilAnalysis.builder()
                    .imageName(imageName)
                    .imagePath(imagePath)
                    .farmerName(farmerName != null ? farmerName : "Unknown")
                    .location(location != null ? location : "Unknown")
                    .texture(getTextValue(root, "texture"))
                    .colorDescription(getTextValue(root, "colorDescription"))
                    .moistureLevel(getTextValue(root, "moistureLevel"))
                    .organicMatter(getTextValue(root, "organicMatter"))
                    .fertilityLevel(getTextValue(root, "fertilityLevel"))
                    .phEstimate(getTextValue(root, "phEstimate"))
                    .isSuitableForCultivation(getBoolValue(root, "isSuitableForCultivation"))
                    .suitabilityScore(getIntValue(root, "suitabilityScore"))
                    .suitabilityReason(getTextValue(root, "suitabilityReason"))
                    .recommendedFertilizers(getArrayAsJson(root, "recommendedFertilizers"))
                    .recommendedNutrients(getArrayAsJson(root, "recommendedNutrients"))
                    .organicImprovements(getArrayAsJson(root, "organicImprovements"))
                    .suitableCrops(getArrayAsJson(root, "suitableCrops"))
                    .generalRecommendations(getArrayAsJson(root, "generalRecommendations"))
                    .analysisLanguage(language != null ? language : "en")
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse soil response JSON: {}", e.getMessage());
            return SoilAnalysis.builder()
                    .imageName(imageName)
                    .imagePath(imagePath)
                    .farmerName(farmerName)
                    .location(location)
                    .suitabilityReason("Analysis parsing failed. Raw response available.")
                    .analysisLanguage(language)
                    .build();
        }
    }

    private SoilAnalysisResponse buildSoilResponse(SoilAnalysis analysis, String status, String message) {
        return SoilAnalysisResponse.builder()
                .id(analysis.getId())
                .imageName(analysis.getImageName())
                .imagePath(analysis.getImagePath())
                .farmerName(analysis.getFarmerName())
                .location(analysis.getLocation())
                .texture(analysis.getTexture())
                .colorDescription(analysis.getColorDescription())
                .moistureLevel(analysis.getMoistureLevel())
                .organicMatter(analysis.getOrganicMatter())
                .fertilityLevel(analysis.getFertilityLevel())
                .phEstimate(analysis.getPhEstimate())
                .isSuitableForCultivation(analysis.getIsSuitableForCultivation())
                .suitabilityScore(analysis.getSuitabilityScore())
                .suitabilityReason(analysis.getSuitabilityReason())
                .recommendedFertilizers(parseJsonArray(analysis.getRecommendedFertilizers()))
                .recommendedNutrients(parseJsonArray(analysis.getRecommendedNutrients()))
                .organicImprovements(parseJsonArray(analysis.getOrganicImprovements()))
                .suitableCrops(parseJsonArray(analysis.getSuitableCrops()))
                .generalRecommendations(parseJsonArray(analysis.getGeneralRecommendations()))
                .status(status)
                .message(message)
                .analysedAt(analysis.getCreatedAt())
                .build();
    }

    private void saveHistory(String type, Long refId, String farmerName, String location,
                              String imageName, String imagePath, String summary, String status) {
        historyRepository.save(AnalysisHistory.builder()
                .analysisType(type)
                .referenceId(refId)
                .farmerName(farmerName)
                .location(location)
                .imageName(imageName)
                .imagePath(imagePath)
                .summary(summary)
                .resultStatus(status)
                .build());
    }

    private String buildSoilSummary(SoilAnalysis a) {
        return String.format("Soil: %s, Fertility: %s, Suitable: %s, Score: %d/100",
                a.getTexture(), a.getFertilityLevel(),
                Boolean.TRUE.equals(a.getIsSuitableForCultivation()) ? "Yes" : "No",
                a.getSuitabilityScore() != null ? a.getSuitabilityScore() : 0);
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
