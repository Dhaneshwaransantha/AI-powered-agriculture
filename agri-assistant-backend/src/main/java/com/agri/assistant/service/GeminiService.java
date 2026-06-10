package com.agri.assistant.service;

import com.agri.assistant.config.GeminiConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    private final GeminiConfig geminiConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ================================================================
    // SOIL ANALYSIS PROMPT
    // ================================================================
    private static final String SOIL_ANALYSIS_PROMPT = """
            You are an expert agricultural soil scientist with 20+ years of experience.
            Analyze the provided soil image carefully and return a structured JSON response.
            
            Examine the soil for:
            1. Physical texture (sandy, clay, loamy, silty, peaty, chalky)
            2. Color (brown, dark brown, red, black, yellow, grey — indicates organic matter and minerals)
            3. Moisture indication (dry, moist, wet, waterlogged)
            4. Organic matter content (low, medium, high)
            5. Fertility level (poor, moderate, good, excellent)
            6. Estimated pH range based on color and appearance
            7. Suitability for cultivation (yes/no with reason)
            
            Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
            {
              "texture": "string",
              "colorDescription": "string",
              "moistureLevel": "Dry | Moist | Wet | Waterlogged",
              "organicMatter": "Low | Medium | High",
              "fertilityLevel": "Poor | Moderate | Good | Excellent",
              "phEstimate": "string (e.g. 5.5-6.5 Slightly Acidic)",
              "isSuitableForCultivation": true or false,
              "suitabilityScore": number (0-100),
              "suitabilityReason": "string",
              "recommendedFertilizers": ["string", "string"],
              "recommendedNutrients": ["string", "string"],
              "organicImprovements": ["string", "string"],
              "suitableCrops": ["string", "string"],
              "generalRecommendations": ["string", "string"]
            }
            
            IMPORTANT: Provide at least 8-10 crop recommendations. Categorize them into short-term (vegetables), medium-term (grains/pulses), and long-term (plantation/fruit trees) crops. Include cash crops and seasonal options.
            Be specific, practical, and farmer-friendly in your recommendations.
            """;

    // ================================================================
    // CROP ANALYSIS PROMPT
    // ================================================================
    private static final String CROP_ANALYSIS_PROMPT = """
            You are an expert agronomist and plant pathologist with deep knowledge of crop diseases,
            growth stages, and precision farming. Analyze the provided crop image carefully.
            
            Identify and analyze:
            1. Crop type and variety if visible
            2. Current growth stage (Germination, Seedling, Vegetative, Flowering, Fruiting, Maturity, Harvest-Ready)
            3. Overall crop health (Excellent, Good, Fair, Poor, Critical)
            4. Estimated days remaining to harvest
            5. Required inputs: water, fertilizers, pesticides
            6. Disease detection: identify any fungal, bacterial, viral, or pest damage
            7. Nutrient deficiencies: nitrogen, phosphorus, potassium, iron, magnesium, etc.
            
            Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
            {
              "cropName": "string",
              "cropVariety": "string or Unknown",
              "confidenceLevel": "High | Medium | Low",
              "growthStage": "string",
              "growthPercentage": number (0-100),
              "daysToHarvest": number,
              "estimatedHarvestDate": "string (approximate)",
              "overallHealth": "Excellent | Good | Fair | Poor | Critical",
              "hasDisease": true or false,
              "diseaseName": "string or None",
              "diseaseSeverity": "Mild | Moderate | Severe | None",
              "diseaseDescription": "string",
              "treatmentMethods": ["string", "string"],
              "preventiveMeasures": ["string", "string"],
              "waterRequirement": "string (e.g. 500ml per plant per day)",
              "fertilizerRequirement": ["string", "string"],
              "pesticideRequirement": ["string or None"],
              "hasDeficiency": true or false,
              "deficiencyType": ["string"],
              "deficiencyTreatment": ["string"],
              "generalRecommendations": ["string", "string"]
            }
            
            Be precise, scientific, and provide actionable guidance for the farmer.
            """;

    /**
     * Analyze soil image using Gemini Vision API
     */
    public String analyzeSoilImage(byte[] imageBytes, String mimeType, String language) {
        String languageInstruction = getLanguageInstruction(language);
        return callGeminiVision(imageBytes, mimeType, SOIL_ANALYSIS_PROMPT + "\n" + languageInstruction);
    }

    /**
     * Analyze crop image using Gemini Vision API
     */
    public String analyzeCropImage(byte[] imageBytes, String mimeType, String language) {
        String languageInstruction = getLanguageInstruction(language);
        return callGeminiVision(imageBytes, mimeType, CROP_ANALYSIS_PROMPT + "\n" + languageInstruction);
    }

    /**
     * Core method: calls Gemini Vision API with image + prompt
     */
    private String callGeminiVision(byte[] imageBytes, String mimeType, String prompt) {
        try {
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            // Build request body
            Map<String, Object> requestBody = new HashMap<>();

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mime_type", mimeType);
            inlineData.put("data", base64Image);

            Map<String, Object> imagePart = new HashMap<>();
            imagePart.put("inline_data", inlineData);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(textPart, imagePart));

            requestBody.put("contents", List.of(content));

            // Generation config
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.2);
            generationConfig.put("topP", 0.8);
            generationConfig.put("maxOutputTokens", 2048);
            requestBody.put("generationConfig", generationConfig);

            // Build HTTP request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Construct full URL: base_url/model:generateContent?key=api_key
            String url = String.format("%s/%s:generateContent?key=%s", 
                    geminiConfig.getApiUrl(), 
                    geminiConfig.getModel(), 
                    geminiConfig.getApiKey());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.debug("Calling Gemini API at: {}", geminiConfig.getApiUrl());

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return extractTextFromGeminiResponse(response.getBody());
            } else {
                log.error("Gemini API returned status: {}", response.getStatusCode());
                throw new RuntimeException("Gemini API call failed with status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Error calling Gemini Vision API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to analyze image with Gemini API: " + e.getMessage(), e);
        }
    }

    /**
     * Extract text content from Gemini API response
     */
    private String extractTextFromGeminiResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");

            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode content = firstCandidate.path("content");
                JsonNode parts = content.path("parts");

                if (parts.isArray() && !parts.isEmpty()) {
                    String text = parts.get(0).path("text").asText();
                    log.debug("Gemini raw response: {}", text);
                    return cleanJsonResponse(text);
                }
            }

            log.error("Unexpected Gemini response structure: {}", responseBody);
            throw new RuntimeException("Could not extract text from Gemini response");

        } catch (Exception e) {
            log.error("Error parsing Gemini response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse Gemini API response", e);
        }
    }

    /**
     * Clean JSON response — removes markdown code blocks if present
     */
    private String cleanJsonResponse(String response) {
        if (response == null) return "{}";
        String cleaned = response.trim();
        // Remove markdown code fences
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }

    /**
     * Get language instruction for Gemini
     */
    private String getLanguageInstruction(String language) {
        if (language == null || language.equalsIgnoreCase("en")) {
            return "Provide all textual descriptions and recommendations in English.";
        }
        
        Map<String, String> langMap = new HashMap<>();
        langMap.put("ta", "Tamil");
        langMap.put("hi", "Hindi");
        langMap.put("te", "Telugu");
        langMap.put("kn", "Kannada");
        langMap.put("ml", "Malayalam");
        langMap.put("mr", "Marathi");
        langMap.put("bn", "Bengali");
        langMap.put("gu", "Gujarati");
        langMap.put("pa", "Punjabi");
        
        String targetLang = langMap.getOrDefault(language.toLowerCase(), "English");
        return String.format("IMPORTANT: Provide all textual values, descriptions, and recommendations in %s language. " +
                "Keep the JSON keys exactly as specified in English, but the values MUST be in %s.", targetLang, targetLang);
    }
}

