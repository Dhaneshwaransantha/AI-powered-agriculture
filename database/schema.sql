-- ============================================================
-- AgriAssist AI - MariaDB Database Schema
-- Run this script to initialize the database
-- ============================================================

CREATE DATABASE IF NOT EXISTS agri_assistant_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE agri_assistant_db;

-- ── Soil Analyses Table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS soil_analyses (
    id                        BIGINT AUTO_INCREMENT PRIMARY KEY,
    image_path                VARCHAR(500) NOT NULL,
    image_name                VARCHAR(255),
    farmer_name               VARCHAR(200),
    location                  VARCHAR(200),

    -- Soil Quality
    texture                   VARCHAR(100),
    color_description         VARCHAR(200),
    moisture_level            VARCHAR(100),
    organic_matter            VARCHAR(100),
    fertility_level           VARCHAR(100),
    ph_estimate               VARCHAR(50),

    -- Cultivation Suitability
    is_suitable_for_cultivation BOOLEAN,
    suitability_score         INT,
    suitability_reason        TEXT,

    -- Recommendations (stored as JSON arrays)
    recommended_fertilizers   TEXT,
    recommended_nutrients     TEXT,
    organic_improvements      TEXT,
    suitable_crops            TEXT,
    general_recommendations   TEXT,

    -- Raw AI Response
    raw_ai_response           LONGTEXT,

    -- Metadata
    analysis_language         VARCHAR(20) DEFAULT 'en',
    created_at                DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at                DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_farmer_name (farmer_name),
    INDEX idx_location (location),
    INDEX idx_created_at (created_at),
    INDEX idx_suitable (is_suitable_for_cultivation)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Crop Analyses Table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS crop_analyses (
    id                        BIGINT AUTO_INCREMENT PRIMARY KEY,
    image_path                VARCHAR(500) NOT NULL,
    image_name                VARCHAR(255),
    farmer_name               VARCHAR(200),
    location                  VARCHAR(200),

    -- Crop Identification
    crop_name                 VARCHAR(150),
    crop_variety              VARCHAR(150),
    confidence_level          VARCHAR(50),

    -- Growth Analysis
    growth_stage              VARCHAR(100),
    growth_percentage         INT,
    days_to_harvest           INT,
    estimated_harvest_date    VARCHAR(100),
    overall_health            VARCHAR(50),

    -- Disease Detection
    has_disease               BOOLEAN,
    disease_name              VARCHAR(200),
    disease_severity          VARCHAR(50),
    disease_description       TEXT,
    treatment_methods         TEXT,
    preventive_measures       TEXT,

    -- Required Inputs
    water_requirement         TEXT,
    fertilizer_requirement    TEXT,
    pesticide_requirement     TEXT,

    -- Deficiency Detection
    has_deficiency            BOOLEAN,
    deficiency_type           TEXT,
    deficiency_treatment      TEXT,
    general_recommendations   TEXT,

    -- Raw AI Response
    raw_ai_response           LONGTEXT,

    -- Metadata
    analysis_language         VARCHAR(20) DEFAULT 'en',
    created_at                DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at                DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_farmer_name (farmer_name),
    INDEX idx_crop_name (crop_name),
    INDEX idx_has_disease (has_disease),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Analysis History Table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS analysis_history (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    analysis_type   VARCHAR(20) NOT NULL COMMENT 'SOIL or CROP',
    reference_id    BIGINT NOT NULL,
    farmer_name     VARCHAR(200),
    location        VARCHAR(200),
    image_name      VARCHAR(255),
    image_path      VARCHAR(500),
    summary         TEXT,
    result_status   VARCHAR(50) DEFAULT 'SUCCESS',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_analysis_type (analysis_type),
    INDEX idx_farmer_name (farmer_name),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Sample Data (Optional) ────────────────────────────────────
-- INSERT INTO soil_analyses (image_path, farmer_name, location, texture, fertility_level, is_suitable_for_cultivation, suitability_score)
-- VALUES ('uploads/soil/sample.jpg', 'Demo Farmer', 'Demo Farm', 'Loamy', 'Good', true, 78);
