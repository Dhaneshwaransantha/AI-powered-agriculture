package com.agri.assistant.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoryResponse {
    private Long id;
    private String analysisType;
    private Long referenceId;
    private String farmerName;
    private String location;
    private String imageName;
    private String imagePath;
    private String summary;
    private String resultStatus;
    private LocalDateTime createdAt;
}
