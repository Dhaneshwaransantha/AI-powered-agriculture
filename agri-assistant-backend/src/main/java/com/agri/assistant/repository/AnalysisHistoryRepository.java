package com.agri.assistant.repository;

import com.agri.assistant.model.AnalysisHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalysisHistoryRepository extends JpaRepository<AnalysisHistory, Long> {

    List<AnalysisHistory> findAllByOrderByCreatedAtDesc();

    List<AnalysisHistory> findByAnalysisTypeOrderByCreatedAtDesc(String analysisType);

    List<AnalysisHistory> findByFarmerNameContainingIgnoreCaseOrderByCreatedAtDesc(String farmerName);

    long countByAnalysisType(String analysisType);
}
