package com.agri.assistant.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStats {
    private Long totalSoilAnalyses;
    private Long totalCropAnalyses;
    private Long suitableSoilCount;
    private Long nonSuitableSoilCount;
    private Long diseasedCropCount;
    private Long deficientCropCount;
    private Long totalAnalyses;
}
