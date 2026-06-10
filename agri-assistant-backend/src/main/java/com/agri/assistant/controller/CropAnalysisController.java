package com.agri.assistant.controller;

import com.agri.assistant.dto.CropAnalysisResponse;
import com.agri.assistant.service.CropAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/crop")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CropAnalysisController {

    private final CropAnalysisService cropAnalysisService;

    /**
     * POST /api/crop/analyze
     * Upload and analyze a crop image
     */
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CropAnalysisResponse> analyzeCrop(
            @RequestPart("image") MultipartFile imageFile,
            @RequestParam(value = "farmerName", defaultValue = "Unknown") String farmerName,
            @RequestParam(value = "location", defaultValue = "Unknown") String location,
            @RequestParam(value = "language", defaultValue = "en") String language) {

        log.info("Received crop analysis request from farmer: {}", farmerName);

        if (imageFile.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    CropAnalysisResponse.builder()
                            .status("ERROR")
                            .message("Image file is required")
                            .build()
            );
        }

        CropAnalysisResponse response = cropAnalysisService.analyzeCrop(imageFile, farmerName, location, language);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/crop/{id}
     * Get a specific crop analysis by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<CropAnalysisResponse> getCropAnalysis(@PathVariable Long id) {
        CropAnalysisResponse response = cropAnalysisService.getCropAnalysisById(id);
        if ("NOT_FOUND".equals(response.getStatus())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/crop/all
     * Get all crop analyses
     */
    @GetMapping("/all")
    public ResponseEntity<List<CropAnalysisResponse>> getAllCropAnalyses() {
        return ResponseEntity.ok(cropAnalysisService.getAllCropAnalyses());
    }
}
