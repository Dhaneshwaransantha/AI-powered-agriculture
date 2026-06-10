package com.agri.assistant.repository;

import com.agri.assistant.model.SoilAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SoilAnalysisRepository extends JpaRepository<SoilAnalysis, Long> {

    List<SoilAnalysis> findByFarmerNameContainingIgnoreCaseOrderByCreatedAtDesc(String farmerName);

    List<SoilAnalysis> findByLocationContainingIgnoreCaseOrderByCreatedAtDesc(String location);

    List<SoilAnalysis> findAllByOrderByCreatedAtDesc();

    @Query("SELECT s FROM SoilAnalysis s WHERE s.isSuitableForCultivation = true ORDER BY s.createdAt DESC")
    List<SoilAnalysis> findSuitableSoils();

    @Query("SELECT COUNT(s) FROM SoilAnalysis s WHERE s.isSuitableForCultivation = true")
    Long countSuitableSoils();

    @Query("SELECT COUNT(s) FROM SoilAnalysis s WHERE s.isSuitableForCultivation = false")
    Long countNonSuitableSoils();
}
