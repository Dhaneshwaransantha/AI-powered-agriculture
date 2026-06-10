package com.agri.assistant.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "analysis_type", nullable = false, length = 20)
    private String analysisType; // SOIL or CROP

    @Column(name = "reference_id", nullable = false)
    private Long referenceId; // ID from soil_analyses or crop_analyses

    @Column(name = "farmer_name")
    private String farmerName;

    @Column(name = "location")
    private String location;

    @Column(name = "image_name")
    private String imageName;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "result_status", length = 50)
    private String resultStatus; // SUCCESS, FAILED, PARTIAL

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
