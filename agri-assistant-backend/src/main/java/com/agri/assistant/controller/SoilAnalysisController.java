package com.agri.assistant.controller;

import com.agri.assistant.dto.SoilAnalysisResponse;
import com.agri.assistant.service.SoilAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/soil")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SoilAnalysisController {

    private final SoilAnalysisService soilAnalysisService;

    /**
     * POST /api/soil/analyze
     * Upload and analyze a soil image
     */
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SoilAnalysisResponse> analyzeSoil(
            @RequestPart("image") MultipartFile imageFile,
            @RequestParam(value = "farmerName", defaultValue = "Unknown") String farmerName,
            @RequestParam(value = "location", defaultValue = "Unknown") String location,
            @RequestParam(value = "language", defaultValue = "en") String language) {

        log.info("Received soil analysis request from farmer: {}", farmerName);

        if (imageFile.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    SoilAnalysisResponse.builder()
                            .status("ERROR")
                            .message("Image file is required")
                            .build()
            );
        }

        SoilAnalysisResponse response = soilAnalysisService.analyzeSoil(imageFile, farmerName, location, language);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/soil/{id}
     * Get a specific soil analysis by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<SoilAnalysisResponse> getSoilAnalysis(@PathVariable Long id) {
        SoilAnalysisResponse response = soilAnalysisService.getSoilAnalysisById(id);
        if ("NOT_FOUND".equals(response.getStatus())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/soil/all
     * Get all soil analyses
     */
    @GetMapping("/all")
    public ResponseEntity<List<SoilAnalysisResponse>> getAllSoilAnalyses() {
        return ResponseEntity.ok(soilAnalysisService.getAllSoilAnalyses());
    }
}
