package com.agri.assistant.service;

import com.agri.assistant.dto.DashboardStats;
import com.agri.assistant.dto.HistoryResponse;
import com.agri.assistant.model.AnalysisHistory;
import com.agri.assistant.repository.AnalysisHistoryRepository;
import com.agri.assistant.repository.CropAnalysisRepository;
import com.agri.assistant.repository.SoilAnalysisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class HistoryService {

    private final AnalysisHistoryRepository historyRepository;
    private final SoilAnalysisRepository soilAnalysisRepository;
    private final CropAnalysisRepository cropAnalysisRepository;

    public List<HistoryResponse> getAllHistory() {
        return historyRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDto).toList();
    }

    public List<HistoryResponse> getHistoryByType(String type) {
        return historyRepository.findByAnalysisTypeOrderByCreatedAtDesc(type.toUpperCase())
                .stream().map(this::toDto).toList();
    }

    public List<HistoryResponse> getHistoryByFarmer(String farmerName) {
        return historyRepository.findByFarmerNameContainingIgnoreCaseOrderByCreatedAtDesc(farmerName)
                .stream().map(this::toDto).toList();
    }

    @Cacheable("history")
    public DashboardStats getDashboardStats() {
        long totalSoil = soilAnalysisRepository.count();
        long totalCrop = cropAnalysisRepository.count();
        long suitableSoil = soilAnalysisRepository.countSuitableSoils();
        long nonSuitableSoil = soilAnalysisRepository.countNonSuitableSoils();
        long diseasedCrop = cropAnalysisRepository.countDiseasedCrops();
        long deficientCrop = cropAnalysisRepository.countDeficientCrops();

        return DashboardStats.builder()
                .totalSoilAnalyses(totalSoil)
                .totalCropAnalyses(totalCrop)
                .suitableSoilCount(suitableSoil)
                .nonSuitableSoilCount(nonSuitableSoil)
                .diseasedCropCount(diseasedCrop)
                .deficientCropCount(deficientCrop)
                .totalAnalyses(totalSoil + totalCrop)
                .build();
    }

    @Transactional
    @CacheEvict(value = "history", allEntries = true)
    public void deleteHistory(Long id) {
        AnalysisHistory history = historyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("History record not found"));

        // 1. Delete actual analysis data based on type
        if ("SOIL".equalsIgnoreCase(history.getAnalysisType())) {
            soilAnalysisRepository.deleteById(history.getReferenceId());
        } else if ("CROP".equalsIgnoreCase(history.getAnalysisType())) {
            cropAnalysisRepository.deleteById(history.getReferenceId());
        }

        // 2. Delete history record
        historyRepository.deleteById(id);
        log.info("Deleted history record and its reference data: ID {}", id);
    }

    private HistoryResponse toDto(AnalysisHistory h) {
        return HistoryResponse.builder()
                .id(h.getId())
                .analysisType(h.getAnalysisType())
                .referenceId(h.getReferenceId())
                .farmerName(h.getFarmerName())
                .location(h.getLocation())
                .imageName(h.getImageName())
                .imagePath(h.getImagePath())
                .summary(h.getSummary())
                .resultStatus(h.getResultStatus())
                .createdAt(h.getCreatedAt())
                .build();
    }
}
