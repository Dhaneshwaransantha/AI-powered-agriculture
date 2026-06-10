package com.agri.assistant.repository;

import com.agri.assistant.model.CropAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CropAnalysisRepository extends JpaRepository<CropAnalysis, Long> {

    List<CropAnalysis> findByFarmerNameContainingIgnoreCaseOrderByCreatedAtDesc(String farmerName);

    List<CropAnalysis> findByCropNameContainingIgnoreCaseOrderByCreatedAtDesc(String cropName);

    List<CropAnalysis> findByHasDiseaseOrderByCreatedAtDesc(Boolean hasDisease);

    List<CropAnalysis> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(c) FROM CropAnalysis c WHERE c.hasDisease = true")
    Long countDiseasedCrops();

    @Query("SELECT COUNT(c) FROM CropAnalysis c WHERE c.hasDeficiency = true")
    Long countDeficientCrops();

    @Query("SELECT c.cropName, COUNT(c) FROM CropAnalysis c GROUP BY c.cropName ORDER BY COUNT(c) DESC")
    List<Object[]> getCropFrequency();
}
