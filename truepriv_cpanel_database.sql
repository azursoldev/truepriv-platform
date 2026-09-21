-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: dpodpco platform
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ai_decision_logs`
--

DROP TABLE IF EXISTS `ai_decision_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ai_decision_logs` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `decision_type` varchar(100) NOT NULL,
  `model_name` varchar(100) NOT NULL DEFAULT 'claude-3-5-sonnet',
  `prompt_tokens` int(11) NOT NULL DEFAULT 0,
  `completion_tokens` int(11) NOT NULL DEFAULT 0,
  `confidence_score` decimal(4,2) NOT NULL DEFAULT 0.95,
  `input_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`input_payload`)),
  `ai_output_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`ai_output_payload`)),
  `human_override_status` enum('pending','accepted','modified','rejected') NOT NULL DEFAULT 'accepted',
  `human_override_rationale` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ai_decision_logs_user_id_foreign` (`user_id`),
  KEY `ai_logs_tenant_decision_idx` (`tenant_id`,`decision_type`),
  CONSTRAINT `ai_decision_logs_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ai_decision_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_decision_logs`
--

LOCK TABLES `ai_decision_logs` WRITE;
/*!40000 ALTER TABLE `ai_decision_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_decision_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approvals`
--

DROP TABLE IF EXISTS `approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `approvals` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `signable_type` varchar(255) NOT NULL,
  `signable_id` char(36) NOT NULL,
  `signer_user_id` char(36) NOT NULL,
  `signer_role` varchar(50) NOT NULL,
  `signature_hash` varchar(64) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `signed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `approvals_signable_type_signable_id_index` (`signable_type`,`signable_id`),
  KEY `approvals_signer_user_id_foreign` (`signer_user_id`),
  KEY `approvals_tenant_id_signed_at_index` (`tenant_id`,`signed_at`),
  CONSTRAINT `approvals_signer_user_id_foreign` FOREIGN KEY (`signer_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `approvals_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approvals`
--

LOCK TABLES `approvals` WRITE;
/*!40000 ALTER TABLE `approvals` DISABLE KEYS */;
/*!40000 ALTER TABLE `approvals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_checklist_items`
--

DROP TABLE IF EXISTS `audit_checklist_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_checklist_items` (
  `id` char(36) NOT NULL,
  `audit_project_id` char(36) NOT NULL,
  `domain` enum('governance_accountability','lawfulness_consent','data_subject_rights','security_measures','third_party_processors','cross_border_transfers') NOT NULL,
  `section_code` varchar(255) NOT NULL,
  `question` text NOT NULL,
  `guidance` text DEFAULT NULL,
  `status` enum('compliant','partially_compliant','non_compliant','not_applicable','pending_review') NOT NULL DEFAULT 'pending_review',
  `max_points` tinyint(4) NOT NULL DEFAULT 5,
  `awarded_points` decimal(4,2) NOT NULL DEFAULT 0.00,
  `auditor_findings` text DEFAULT NULL,
  `client_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_checklist_items_audit_project_id_domain_status_index` (`audit_project_id`,`domain`,`status`),
  CONSTRAINT `audit_checklist_items_audit_project_id_foreign` FOREIGN KEY (`audit_project_id`) REFERENCES `audit_projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_checklist_items`
--

LOCK TABLES `audit_checklist_items` WRITE;
/*!40000 ALTER TABLE `audit_checklist_items` DISABLE KEYS */;
INSERT INTO `audit_checklist_items` VALUES ('01a06254-0f90-7318-9ec6-1bf98f87e420','01a06254-0f65-7381-8948-0029d0151bb9','governance_accountability','NDPA-SEC-24','Has the organization formally designated a qualified Data Protection Officer (DPO) and registered with the NDPC?','Verify formal appointment letter, board approval minute, and NDPC registration certificate.','compliant',5,5.00,'DPO formally appointed by Board of Directors on 15 Jan 2026. Registration ref NDPC/DCMI/2026/0891 verified.','Appointment letter and board charter attached in evidence vault.','2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-0f95-7224-99b6-41f62fddacaf','01a06254-0f65-7381-8948-0029d0151bb9','security_measures','NDPA-SEC-39','Are technical and organizational measures implemented to protect personal data against unauthorized access, loss, or alteration (Encryption, MFA, Access Controls)?','Review network architecture diagrams, AES-256 encryption status for databases, and recent vulnerability assessment report.','compliant',5,4.50,'AES-256 encryption verified on primary database. MFA enforced on all administrative portals.',NULL,'2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-0f9a-71a1-8f03-2dc14d953e02','01a06254-0f65-7381-8948-0029d0151bb9','third_party_processors','NDPA-SEC-29','Are binding Data Processing Agreements (DPAs) executed with all third-party vendors handling customer personal data?','Inspect signed DPAs for cloud providers, payment gateways, and IT support contractors.','partially_compliant',5,2.50,'DPAs executed with Smile Identity and Interswitch. Outstanding DPA with secondary SMS gateway vendor.',NULL,'2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-0fa4-72f7-96b0-77d9f86b0bce','01a06254-0f65-7381-8948-0029d0151bb9','data_subject_rights','NDPA-SEC-34','Is there an operational mechanism for data subjects to exercise their access, rectification, and erasure rights within 30 days?','Review DSAR intake portal, ticketing log, and average SLA resolution timeline.','compliant',5,4.00,'Automated DSAR portal live on website. 3 requests processed within statutory 30-day timeline.',NULL,'2026-09-02 08:34:31','2026-09-02 08:34:31');
/*!40000 ALTER TABLE `audit_checklist_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_comments`
--

DROP TABLE IF EXISTS `audit_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_comments` (
  `id` char(36) NOT NULL,
  `audit_project_id` char(36) NOT NULL,
  `finding_id` char(36) DEFAULT NULL,
  `user_id` char(36) NOT NULL,
  `comment_text` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_comments_finding_id_foreign` (`finding_id`),
  KEY `audit_comments_user_id_foreign` (`user_id`),
  KEY `audit_comments_audit_project_id_created_at_index` (`audit_project_id`,`created_at`),
  CONSTRAINT `audit_comments_audit_project_id_foreign` FOREIGN KEY (`audit_project_id`) REFERENCES `audit_projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `audit_comments_finding_id_foreign` FOREIGN KEY (`finding_id`) REFERENCES `audit_findings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `audit_comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_comments`
--

LOCK TABLES `audit_comments` WRITE;
/*!40000 ALTER TABLE `audit_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_evidences`
--

DROP TABLE IF EXISTS `audit_evidences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_evidences` (
  `id` char(36) NOT NULL,
  `audit_project_id` char(36) NOT NULL,
  `checklist_item_id` char(36) DEFAULT NULL,
  `file_title` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `uploaded_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_evidences_uploaded_by_foreign` (`uploaded_by`),
  KEY `audit_evidences_audit_project_id_foreign` (`audit_project_id`),
  KEY `audit_evidences_checklist_item_id_foreign` (`checklist_item_id`),
  CONSTRAINT `audit_evidences_audit_project_id_foreign` FOREIGN KEY (`audit_project_id`) REFERENCES `audit_projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `audit_evidences_checklist_item_id_foreign` FOREIGN KEY (`checklist_item_id`) REFERENCES `audit_checklist_items` (`id`) ON DELETE SET NULL,
  CONSTRAINT `audit_evidences_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_evidences`
--

LOCK TABLES `audit_evidences` WRITE;
/*!40000 ALTER TABLE `audit_evidences` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_evidences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_findings`
--

DROP TABLE IF EXISTS `audit_findings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_findings` (
  `id` char(36) NOT NULL,
  `audit_project_id` char(36) NOT NULL,
  `checklist_item_id` char(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `severity` enum('critical','high','medium','low','observation') NOT NULL DEFAULT 'medium',
  `recommendation` text NOT NULL,
  `remediation_plan` text DEFAULT NULL,
  `assigned_to` char(36) DEFAULT NULL,
  `target_resolution_date` date DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `status` enum('open','in_remediation','resolved','verified_closed') NOT NULL DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_findings_assigned_to_foreign` (`assigned_to`),
  KEY `audit_findings_checklist_item_id_foreign` (`checklist_item_id`),
  KEY `audit_findings_audit_project_id_severity_status_index` (`audit_project_id`,`severity`,`status`),
  CONSTRAINT `audit_findings_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `audit_findings_audit_project_id_foreign` FOREIGN KEY (`audit_project_id`) REFERENCES `audit_projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `audit_findings_checklist_item_id_foreign` FOREIGN KEY (`checklist_item_id`) REFERENCES `audit_checklist_items` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_findings`
--

LOCK TABLES `audit_findings` WRITE;
/*!40000 ALTER TABLE `audit_findings` DISABLE KEYS */;
INSERT INTO `audit_findings` VALUES ('01a06254-0fd0-73ed-94e3-beeb5ed470e8','01a06254-0f65-7381-8948-0029d0151bb9','01a06254-0f9a-71a1-8f03-2dc14d953e02','Missing Data Processing Agreement (DPA) with Bulk SMS Gateway Vendor','During audit fieldwork, it was observed that SMS Gateway Provider X receives customer phone numbers and OTP payloads without an executed NDPA-compliant Data Processing Agreement.','high','Execute standard DPCO-approved DPA template with SMS Provider X specifying data protection obligations, sub-processor restrictions, and breach notification SLAs within 7 days.','Legal team has dispatched standard DPA contract to vendor on 20 Aug 2026. Awaiting counter-signature.','01a06254-08f8-7226-8e76-ea82f458bb00','2026-09-16',NULL,'in_remediation','2026-09-02 08:34:31','2026-09-02 08:34:31');
/*!40000 ALTER TABLE `audit_findings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) DEFAULT NULL,
  `user_id` char(36) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(255) DEFAULT NULL,
  `entity_id` varchar(255) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id_foreign` (`user_id`),
  KEY `audit_logs_tenant_id_created_at_index` (`tenant_id`,`created_at`),
  CONSTRAINT `audit_logs_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_projects`
--

DROP TABLE IF EXISTS `audit_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_projects` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `dpco_firm_id` char(36) DEFAULT NULL,
  `lead_auditor_id` char(36) DEFAULT NULL,
  `audit_year` int(11) NOT NULL DEFAULT 2026,
  `title` varchar(255) NOT NULL,
  `scope_description` text DEFAULT NULL,
  `overall_score` decimal(5,2) NOT NULL DEFAULT 0.00,
  `compliance_level` enum('substantially_compliant','partially_compliant','non_compliant','not_assessed') NOT NULL DEFAULT 'not_assessed',
  `status` enum('draft','scoping','fieldwork','remediation_in_progress','final_review','dpco_certified','filed_with_ndpc') NOT NULL DEFAULT 'draft',
  `dpco_seal_code` varchar(255) DEFAULT NULL,
  `ndpc_acknowledgement_ref` varchar(255) DEFAULT NULL,
  `executive_summary` text DEFAULT NULL,
  `certified_at` timestamp NULL DEFAULT NULL,
  `filed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_projects_lead_auditor_id_foreign` (`lead_auditor_id`),
  KEY `audit_projects_dpco_firm_id_foreign` (`dpco_firm_id`),
  KEY `audit_projects_tenant_id_audit_year_status_index` (`tenant_id`,`audit_year`,`status`),
  CONSTRAINT `audit_projects_dpco_firm_id_foreign` FOREIGN KEY (`dpco_firm_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL,
  CONSTRAINT `audit_projects_lead_auditor_id_foreign` FOREIGN KEY (`lead_auditor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `audit_projects_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_projects`
--

LOCK TABLES `audit_projects` WRITE;
/*!40000 ALTER TABLE `audit_projects` DISABLE KEYS */;
INSERT INTO `audit_projects` VALUES ('01a06254-0f65-7381-8948-0029d0151bb9','65ec75a3-5d0c-4119-9a3d-4033966725cc','70cb4a9e-ff09-4905-ab6d-f5ab7d26677e','01a06254-0c9e-7132-94af-a3aa7846f36b',2026,'NDPC Statutory Annual Data Protection Audit 2026','Full-scope statutory compliance audit of Apex Microfinance Bank across all digital banking channels, branch operations, third-party vendor relationships, and IT infrastructure pursuant to NDPA 2023 & NDPC GAID requirements.',78.50,'partially_compliant','remediation_in_progress','DPCO-SEAL-2026-APX-883',NULL,'Apex Microfinance Bank demonstrates substantial progress in governance, data inventory mapping, and technical encryption. Critical remediation is required for cross-border transfer documentation and employee annual refresher training before final filing with NDPC.',NULL,NULL,'2026-09-02 08:34:31','2026-09-02 08:34:31');
/*!40000 ALTER TABLE `audit_projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `breach_playbook_steps`
--

DROP TABLE IF EXISTS `breach_playbook_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `breach_playbook_steps` (
  `id` char(36) NOT NULL,
  `data_breach_id` char(36) NOT NULL,
  `step_code` varchar(50) NOT NULL,
  `step_name` varchar(255) NOT NULL,
  `status` enum('pending','in_progress','completed','skipped') NOT NULL DEFAULT 'pending',
  `executed_by_user_id` char(36) DEFAULT NULL,
  `atomic_started_at` timestamp NULL DEFAULT NULL,
  `atomic_completed_at` timestamp NULL DEFAULT NULL,
  `playbook_output_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`playbook_output_data`)),
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `breach_playbook_steps_executed_by_user_id_foreign` (`executed_by_user_id`),
  KEY `breach_step_idx` (`data_breach_id`,`step_code`),
  CONSTRAINT `breach_playbook_steps_data_breach_id_foreign` FOREIGN KEY (`data_breach_id`) REFERENCES `data_breaches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `breach_playbook_steps_executed_by_user_id_foreign` FOREIGN KEY (`executed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `breach_playbook_steps`
--

LOCK TABLES `breach_playbook_steps` WRITE;
/*!40000 ALTER TABLE `breach_playbook_steps` DISABLE KEYS */;
/*!40000 ALTER TABLE `breach_playbook_steps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_profiles`
--

DROP TABLE IF EXISTS `company_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `company_profiles` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `cac_rc_number` varchar(50) DEFAULT NULL,
  `tax_identification_number` varchar(50) DEFAULT NULL,
  `sector` varchar(100) DEFAULT NULL,
  `data_protection_officer_name` varchar(255) DEFAULT NULL,
  `data_protection_officer_email` varchar(255) DEFAULT NULL,
  `mdc_classification_tier` enum('non_mdc','mdc_medium','mdc_high','mdc_extra_high') NOT NULL DEFAULT 'non_mdc',
  `employee_count_bracket` varchar(50) DEFAULT NULL,
  `annual_data_subjects_processed` int(11) NOT NULL DEFAULT 0,
  `registered_office_address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `company_profiles_tenant_id_unique` (`tenant_id`),
  CONSTRAINT `company_profiles_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_profiles`
--

LOCK TABLES `company_profiles` WRITE;
/*!40000 ALTER TABLE `company_profiles` DISABLE KEYS */;
INSERT INTO `company_profiles` VALUES ('01a06254-07a3-708b-a2fd-1e4340323d49','65ec75a3-5d0c-4119-9a3d-4033966725cc','RC-1489201','TIN-29104918-0001','Banking & Financial Technology','Amina Bello','dpo@apexmfb.ng','mdc_high','100-250 employees',150000,'Plot 12, Adeola Odeku Street, Victoria Island, Lagos State','2026-09-02 08:34:29','2026-09-02 08:34:29');
/*!40000 ALTER TABLE `company_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cookie_banners`
--

DROP TABLE IF EXISTS `cookie_banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cookie_banners` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `domain` varchar(255) NOT NULL,
  `theme_color` varchar(255) NOT NULL DEFAULT '#059669',
  `position` enum('bottom_bar','floating_bottom_left','floating_bottom_right','center_modal') NOT NULL DEFAULT 'bottom_bar',
  `privacy_policy_url` varchar(255) DEFAULT NULL,
  `company_display_name` varchar(255) DEFAULT NULL,
  `custom_notice_text` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cookie_banners_tenant_id_foreign` (`tenant_id`),
  CONSTRAINT `cookie_banners_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cookie_banners`
--

LOCK TABLES `cookie_banners` WRITE;
/*!40000 ALTER TABLE `cookie_banners` DISABLE KEYS */;
INSERT INTO `cookie_banners` VALUES ('01a06254-1090-7031-956d-2825d8613963','65ec75a3-5d0c-4119-9a3d-4033966725cc','https://apexmfb.ng','#059669','bottom_bar','https://apexmfb.ng/privacy','Apex Microfinance Bank','We use necessary cookies for secure online banking and analytics cookies to optimize performance in compliance with NDPA 2023.',1,'2026-09-02 08:34:31','2026-09-02 08:34:31');
/*!40000 ALTER TABLE `cookie_banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cookie_consents`
--

DROP TABLE IF EXISTS `cookie_consents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cookie_consents` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `visitor_uuid` varchar(255) NOT NULL,
  `accepted_categories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`accepted_categories`)),
  `ip_hash` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `consented_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cookie_consents_tenant_id_consented_at_index` (`tenant_id`,`consented_at`),
  CONSTRAINT `cookie_consents_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cookie_consents`
--

LOCK TABLES `cookie_consents` WRITE;
/*!40000 ALTER TABLE `cookie_consents` DISABLE KEYS */;
INSERT INTO `cookie_consents` VALUES ('01a06254-10bc-704b-9d79-57ce184656dd','65ec75a3-5d0c-4119-9a3d-4033966725cc','a580ea23-5a6c-4702-a416-9e689eee3d1a','{\"necessary\":true,\"functional\":false,\"analytics\":false,\"marketing\":false}','81832bfa2897fcf99e5af0a25c40d509d1f9a51380eae9e5ae19fd4cc573dd5c','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','2026-09-02 04:34:31','2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-10c3-73db-b947-5f52343343fe','65ec75a3-5d0c-4119-9a3d-4033966725cc','bd7c9cdc-8eba-4fb6-9252-e21cb324a9b4','{\"necessary\":true,\"functional\":true,\"analytics\":false,\"marketing\":false}','43c42bebfd901726248f2f1a3aa0bf57b53359198b40d7a14e54a028a18f9e03','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','2026-09-02 00:34:31','2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-10c7-7289-b5b2-31d9c670ce1f','65ec75a3-5d0c-4119-9a3d-4033966725cc','af5b0cfa-262f-401a-9d03-40736eec3ebe','{\"necessary\":true,\"functional\":false,\"analytics\":true,\"marketing\":false}','609a02d14d19a862cb256ff7c11cf382090592761d86d02544a5a0ab7c634434','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','2026-09-01 20:34:31','2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-10cc-73e4-9b3a-71643ecfef53','65ec75a3-5d0c-4119-9a3d-4033966725cc','b5367475-145d-49ae-8d79-1bb0e6ed0cbd','{\"necessary\":true,\"functional\":true,\"analytics\":false,\"marketing\":true}','e68baafc8410c504e924fd5e5add554166a7b46bd3ac030563905e17c5313c7f','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','2026-09-01 16:34:31','2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-10d1-71d9-b24d-57acb37fdd66','65ec75a3-5d0c-4119-9a3d-4033966725cc','9ba74477-1595-4572-b76e-bd4f65058d06','{\"necessary\":true,\"functional\":false,\"analytics\":false,\"marketing\":false}','8f75555d6556bc61de6282db9f6602c8d1d8bfa143a646939e2f857b2bb2b3a0','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','2026-09-01 12:34:31','2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-10d6-739d-b649-ec70a7e0a06e','65ec75a3-5d0c-4119-9a3d-4033966725cc','22449a17-b078-4d9f-8c7c-1870cf62069a','{\"necessary\":true,\"functional\":true,\"analytics\":true,\"marketing\":false}','b5ec0cba1d9685730ee21f4053c4385cbafb71708b2e47d535c8cffdf8ddbf51','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','2026-09-01 08:34:31','2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-10db-715a-babc-35ea9f2aca49','65ec75a3-5d0c-4119-9a3d-4033966725cc','cf70f3bb-2929-4ff8-a503-210210d5b01b','{\"necessary\":true,\"functional\":false,\"analytics\":false,\"marketing\":false}','1b84349e58c774cd4f080fa6e1ffaae01da1d4613b0ab4ae18693bf3974a654f','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','2026-09-01 04:34:31','2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-10df-70e7-8957-82ae900c3a3b','65ec75a3-5d0c-4119-9a3d-4033966725cc','3d261e12-1ce4-4848-9be0-402dd4a31712','{\"necessary\":true,\"functional\":true,\"analytics\":false,\"marketing\":true}','cebd99a86382dd9fcfab37bac3d0d61257ba716e417dd1ea5e26b2a9e7dc4055','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','2026-09-01 00:34:31','2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-10e5-71c4-b9ec-669fe2a4a911','65ec75a3-5d0c-4119-9a3d-4033966725cc','21dad853-7581-4831-8c60-896a0464bf35','{\"necessary\":true,\"functional\":false,\"analytics\":true,\"marketing\":false}','7cce113512333f236f6c3fe78520a5b7b4c5b313db30730a0eda782a103cf103','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','2026-08-31 20:34:31','2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-10e9-7350-9e39-5bfdef079740','65ec75a3-5d0c-4119-9a3d-4033966725cc','e65bb1e2-d861-4fa5-9411-ac2cbbdda272','{\"necessary\":true,\"functional\":true,\"analytics\":false,\"marketing\":false}','33112b8402de2b1d3fb16be26f7ca064874cbde65c995fe4842b77bfc2af0944','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','2026-08-31 16:34:31','2026-09-02 08:34:31','2026-09-02 08:34:31');
/*!40000 ALTER TABLE `cookie_consents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cross_border_transfers`
--

DROP TABLE IF EXISTS `cross_border_transfers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cross_border_transfers` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `ropa_activity_id` char(36) DEFAULT NULL,
  `destination_country_code` varchar(3) NOT NULL,
  `destination_country_name` varchar(100) NOT NULL,
  `recipient_entity_name` varchar(255) NOT NULL,
  `recipient_entity_type` enum('sub_processor','joint_controller','group_affiliate','public_authority') NOT NULL DEFAULT 'sub_processor',
  `ndpc_transfer_mechanism` enum('adequacy_decision','standard_contractual_clauses_scc','binding_corporate_rules_bcr','explicit_consent_derogation','statutory_public_interest') NOT NULL DEFAULT 'standard_contractual_clauses_scc',
  `safeguard_documentation_ref` varchar(255) DEFAULT NULL,
  `annual_transfer_volume_estimate` int(11) NOT NULL DEFAULT 0,
  `encryption_in_transit_standard` varchar(100) NOT NULL DEFAULT 'TLS 1.3 / AES-256',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cross_border_transfers_ropa_activity_id_foreign` (`ropa_activity_id`),
  KEY `cb_tenant_country_idx` (`tenant_id`,`destination_country_code`),
  CONSTRAINT `cross_border_transfers_ropa_activity_id_foreign` FOREIGN KEY (`ropa_activity_id`) REFERENCES `ropa_activities` (`id`) ON DELETE SET NULL,
  CONSTRAINT `cross_border_transfers_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cross_border_transfers`
--

LOCK TABLES `cross_border_transfers` WRITE;
/*!40000 ALTER TABLE `cross_border_transfers` DISABLE KEYS */;
/*!40000 ALTER TABLE `cross_border_transfers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_breaches`
--

DROP TABLE IF EXISTS `data_breaches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_breaches` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `incident_number` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `nature_of_incident` enum('unauthorized_access','ransomware_malware','lost_stolen_device','accidental_disclosure_email','insider_threat','phishing_credential_theft','physical_theft','misconfigured_cloud_bucket','other') NOT NULL,
  `date_time_occurred` timestamp NULL DEFAULT NULL,
  `date_time_discovered` timestamp NOT NULL DEFAULT current_timestamp(),
  `ndpc_notification_deadline` timestamp NULL DEFAULT NULL,
  `estimated_affected_subjects` int(11) NOT NULL DEFAULT 0,
  `compromised_data_categories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`compromised_data_categories`)),
  `risk_assessment_level` enum('low','medium','high_to_rights_freedoms','critical_systemic') NOT NULL DEFAULT 'medium',
  `is_ndpc_notified` tinyint(1) NOT NULL DEFAULT 0,
  `ndpc_notified_at` timestamp NULL DEFAULT NULL,
  `ndpc_reference_number` varchar(255) DEFAULT NULL,
  `are_subjects_notified` tinyint(1) NOT NULL DEFAULT 0,
  `subjects_notified_at` timestamp NULL DEFAULT NULL,
  `containment_steps_taken` text DEFAULT NULL,
  `remedial_measures` text DEFAULT NULL,
  `root_cause_analysis` text DEFAULT NULL,
  `status` enum('reported_triage','investigation','containment_remediation','ndpc_notified','closed') NOT NULL DEFAULT 'reported_triage',
  `lead_responder_id` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `data_breaches_incident_number_unique` (`incident_number`),
  KEY `data_breaches_lead_responder_id_foreign` (`lead_responder_id`),
  KEY `breach_tenant_status_sla_idx` (`tenant_id`,`status`,`ndpc_notification_deadline`),
  CONSTRAINT `data_breaches_lead_responder_id_foreign` FOREIGN KEY (`lead_responder_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `data_breaches_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_breaches`
--

LOCK TABLES `data_breaches` WRITE;
/*!40000 ALTER TABLE `data_breaches` DISABLE KEYS */;
INSERT INTO `data_breaches` VALUES ('01a06254-1037-729a-a2e4-0f58e9c045d4','65ec75a3-5d0c-4119-9a3d-4033966725cc','INC-2026-003','Suspicious Credential Stuffing Attempt on Mobile API Gateway','unauthorized_access','2026-09-01 06:34:31','2026-09-01 08:34:31','2026-09-04 08:34:31',140,'[\"Masked Phone Numbers\",\"Hashed Password Attempts\",\"Login IP Geolocation\"]','medium',0,NULL,NULL,0,NULL,'IP rate limiting enforced on API gateway, automated account lockouts triggered for affected accounts, force password reset initiated for 140 users.','Cloudflare Bot Management rules updated, WAF threshold lowered, customer advisory email prepared.',NULL,'containment_remediation','01a06254-0a25-713b-90c3-cda9f16943dc','2026-09-02 08:34:31','2026-09-02 08:34:31');
/*!40000 ALTER TABLE `data_breaches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_controller_classifications`
--

DROP TABLE IF EXISTS `data_controller_classifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_controller_classifications` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `calculated_tier` enum('standard_controller','mdc_high','mdc_extra_high','mdc_ultra_high') NOT NULL DEFAULT 'standard_controller',
  `criteria_evaluated` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`criteria_evaluated`)),
  `annual_filing_fee_applicable` decimal(10,2) NOT NULL DEFAULT 0.00,
  `mandatory_dpo_required` tinyint(1) NOT NULL DEFAULT 1,
  `statutory_audit_mandatory` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dcc_tenant_tier_idx` (`tenant_id`,`calculated_tier`),
  CONSTRAINT `data_controller_classifications_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_controller_classifications`
--

LOCK TABLES `data_controller_classifications` WRITE;
/*!40000 ALTER TABLE `data_controller_classifications` DISABLE KEYS */;
INSERT INTO `data_controller_classifications` VALUES ('01a06254-07c2-71f1-b96b-832f46c5b7cb','65ec75a3-5d0c-4119-9a3d-4033966725cc','mdc_high','{\"financial_data\":true,\"biometric_kyc\":true,\"records_volume\":150000}',250000.00,1,1,'2026-09-02 08:34:29','2026-09-02 08:34:29');
/*!40000 ALTER TABLE `data_controller_classifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dpco_profiles`
--

DROP TABLE IF EXISTS `dpco_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dpco_profiles` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `ndpc_license_number` varchar(100) NOT NULL,
  `managing_partner_name` varchar(255) NOT NULL,
  `managing_partner_email` varchar(255) NOT NULL,
  `accreditation_year` year(4) DEFAULT NULL,
  `digital_seal_signature_hash` varchar(255) DEFAULT NULL,
  `license_status` enum('active','suspended','under_renewal') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dpco_profiles_tenant_id_unique` (`tenant_id`),
  UNIQUE KEY `dpco_profiles_ndpc_license_number_unique` (`ndpc_license_number`),
  CONSTRAINT `dpco_profiles_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dpco_profiles`
--

LOCK TABLES `dpco_profiles` WRITE;
/*!40000 ALTER TABLE `dpco_profiles` DISABLE KEYS */;
INSERT INTO `dpco_profiles` VALUES ('01a06254-0b8f-73c9-84ac-82010c3d10c8','70cb4a9e-ff09-4905-ab6d-f5ab7d26677e','NDPC/DPCO/2026/042','Dr. Folake Adeleke','lead.partner@vanguarddpco.ng',2026,'SHA256:88391AC9901482E198305F9A88710B6C','active','2026-09-02 08:34:30','2026-09-02 08:34:30');
/*!40000 ALTER TABLE `dpco_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dpia_assessments`
--

DROP TABLE IF EXISTS `dpia_assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dpia_assessments` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `ropa_id` char(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `high_risk_reasons` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`high_risk_reasons`)),
  `nature_of_processing` text DEFAULT NULL,
  `necessity_proportionality_check` text DEFAULT NULL,
  `inherent_likelihood` tinyint(4) NOT NULL DEFAULT 3,
  `inherent_impact` tinyint(4) NOT NULL DEFAULT 3,
  `inherent_risk_score` tinyint(4) NOT NULL DEFAULT 9,
  `inherent_risk_level` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `mitigation_measures` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mitigation_measures`)),
  `residual_likelihood` tinyint(4) NOT NULL DEFAULT 1,
  `residual_impact` tinyint(4) NOT NULL DEFAULT 2,
  `residual_risk_score` tinyint(4) NOT NULL DEFAULT 2,
  `residual_risk_level` enum('low','medium','high','critical') NOT NULL DEFAULT 'low',
  `dpo_recommendations` text DEFAULT NULL,
  `dpo_sign_off_status` enum('pending','approved','requires_consultation_ndpc','rejected') NOT NULL DEFAULT 'pending',
  `dpco_review_notes` text DEFAULT NULL,
  `approved_by` char(36) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dpia_assessments_approved_by_foreign` (`approved_by`),
  KEY `dpia_assessments_ropa_id_foreign` (`ropa_id`),
  KEY `dpia_tenant_status_risk_idx` (`tenant_id`,`dpo_sign_off_status`,`residual_risk_level`),
  CONSTRAINT `dpia_assessments_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `dpia_assessments_ropa_id_foreign` FOREIGN KEY (`ropa_id`) REFERENCES `ropa_activities` (`id`) ON DELETE SET NULL,
  CONSTRAINT `dpia_assessments_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dpia_assessments`
--

LOCK TABLES `dpia_assessments` WRITE;
/*!40000 ALTER TABLE `dpia_assessments` DISABLE KEYS */;
INSERT INTO `dpia_assessments` VALUES ('01a06254-0f39-7269-ac4d-bcdc13b7fb58','65ec75a3-5d0c-4119-9a3d-4033966725cc','01a06254-0f09-7265-b6f2-d9918e50a7e0','DPIA on Biometric Customer Onboarding & Cloud Verification','Comprehensive impact assessment on collecting facial biometrics and verifying live selfies against the Nigerian National Identity Database (NIMC).','[\"Processing of biometric data for uniquely identifying individuals (NDPA Sec 30)\",\"Cross-border data transfer to AWS Cloud in Ireland\",\"Large scale processing of financial identity credentials (BVN\\/NIN)\"]','Liveness facial match check conducted via mobile SDK, encrypted in transit, cross-referenced with NIMC API via licensed partner.','Necessary to prevent synthetic identity fraud, money laundering, and comply with mandatory CBN Tier 3 KYC directives.',4,4,16,'high','[\"Field-level AES-256 encryption applied before database insertion\",\"Biometric templates deleted immediately after match score calculation\",\"Standard Contractual Clauses executed with cloud provider\",\"Regular penetration testing and NDPC compliant audit trail logging\"]',2,2,4,'low','The technical safeguards are proportionate. Recommend quarterly review of cloud IAM permissions and keeping the vendor DPA active.','approved','Verified during 2026 DPCO annual audit. Safeguards meet NDPA Section 28 & 39 standards.','01a06254-0a25-713b-90c3-cda9f16943dc','2026-08-25 08:34:31','2026-09-02 08:34:31','2026-09-02 08:34:31');
/*!40000 ALTER TABLE `dpia_assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dpo_profiles`
--

DROP TABLE IF EXISTS `dpo_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dpo_profiles` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `lead_consultant_name` varchar(255) NOT NULL,
  `lead_consultant_email` varchar(255) NOT NULL,
  `professional_certifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`professional_certifications`)),
  `consulting_tier` varchar(50) NOT NULL DEFAULT 'standard',
  `active_client_capacity` int(11) NOT NULL DEFAULT 10,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dpo_profiles_tenant_id_unique` (`tenant_id`),
  CONSTRAINT `dpo_profiles_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dpo_profiles`
--

LOCK TABLES `dpo_profiles` WRITE;
/*!40000 ALTER TABLE `dpo_profiles` DISABLE KEYS */;
INSERT INTO `dpo_profiles` VALUES ('01a06254-0a5c-70b0-8b30-85bba7324c90','58e16bd6-5a2a-417a-861a-1c8ddb3c4bb2','Barrister Chukwuma Obi','lead.dpo@fortressadvisory.ng','[\"CDPO (Certified Data Protection Officer)\",\"CIPM\",\"LLM Cyberlaw\"]','executive_partner',15,'2026-09-02 08:34:29','2026-09-02 08:34:29');
/*!40000 ALTER TABLE `dpo_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dsar_actions`
--

DROP TABLE IF EXISTS `dsar_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dsar_actions` (
  `id` char(36) NOT NULL,
  `dsar_request_id` char(36) NOT NULL,
  `performed_by_user_id` char(36) DEFAULT NULL,
  `action_type` enum('id_verified','records_retrieved','redaction_applied','response_dispatched','rejected','sla_extended','note_logged') NOT NULL DEFAULT 'note_logged',
  `action_notes` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dsar_actions_performed_by_user_id_foreign` (`performed_by_user_id`),
  KEY `dsar_actions_dsar_request_id_created_at_index` (`dsar_request_id`,`created_at`),
  CONSTRAINT `dsar_actions_dsar_request_id_foreign` FOREIGN KEY (`dsar_request_id`) REFERENCES `dsar_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `dsar_actions_performed_by_user_id_foreign` FOREIGN KEY (`performed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dsar_actions`
--

LOCK TABLES `dsar_actions` WRITE;
/*!40000 ALTER TABLE `dsar_actions` DISABLE KEYS */;
/*!40000 ALTER TABLE `dsar_actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dsar_requests`
--

DROP TABLE IF EXISTS `dsar_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dsar_requests` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `ticket_number` varchar(255) NOT NULL,
  `request_type` enum('access_copy','rectification','erasure','objection','restrict_processing','data_portability') NOT NULL,
  `data_subject_name` varchar(255) NOT NULL,
  `data_subject_email` varchar(255) NOT NULL,
  `data_subject_phone` varchar(255) DEFAULT NULL,
  `subject_relationship` enum('customer','former_customer','employee','job_applicant','vendor_contact','other') NOT NULL DEFAULT 'customer',
  `request_details` text NOT NULL,
  `id_document_path` varchar(255) DEFAULT NULL,
  `id_verified` tinyint(1) NOT NULL DEFAULT 0,
  `sla_deadline` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('submitted','identity_verified','investigating','action_taken','completed','rejected') NOT NULL DEFAULT 'submitted',
  `response_summary` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `assigned_dpo_id` char(36) DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dsar_requests_ticket_number_unique` (`ticket_number`),
  KEY `dsar_requests_assigned_dpo_id_foreign` (`assigned_dpo_id`),
  KEY `dsar_requests_tenant_id_status_sla_deadline_index` (`tenant_id`,`status`,`sla_deadline`),
  CONSTRAINT `dsar_requests_assigned_dpo_id_foreign` FOREIGN KEY (`assigned_dpo_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `dsar_requests_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dsar_requests`
--

LOCK TABLES `dsar_requests` WRITE;
/*!40000 ALTER TABLE `dsar_requests` DISABLE KEYS */;
INSERT INTO `dsar_requests` VALUES ('01a06254-1006-7163-b2b2-205115b6e2b6','65ec75a3-5d0c-4119-9a3d-4033966725cc','DSAR-2026-1049','access_copy','Olumide Adeleke','olumide.adeleke@gmail.com','+2348039911223','customer','I request a complete copy of all my personal data, transaction history, and credit assessment records held on your mobile banking platform.',NULL,1,'2026-09-20 08:34:31','investigating',NULL,NULL,'01a06254-0a25-713b-90c3-cda9f16943dc',NULL,'2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-100d-7194-9f6e-50e7fa758232','65ec75a3-5d0c-4119-9a3d-4033966725cc','DSAR-2026-1050','erasure','Ngozi Eze','ngozi.eze@yahoo.com','+2348051234567','former_customer','I closed my account 2 years ago and request the erasure of my profile and marketing contact information.',NULL,1,'2026-09-07 08:34:31','action_taken',NULL,NULL,'01a06254-0a25-713b-90c3-cda9f16943dc',NULL,'2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a0625a-7502-7361-a473-29dc4fe105ce','65ec75a3-5d0c-4119-9a3d-4033966725cc','DSAR-2026-UZKPW7','access_copy','test','sohaibshaikh186@gmail.com','3167779677','customer','test',NULL,1,'2026-09-02 13:42:19','completed','Request investigated and response delivered to data subject.',NULL,NULL,'2026-09-02 08:42:19','2026-09-02 08:41:30','2026-09-02 08:42:19');
/*!40000 ALTER TABLE `dsar_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guest_invitations`
--

DROP TABLE IF EXISTS `guest_invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `guest_invitations` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `invited_by_user_id` char(36) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `assigned_role` varchar(50) NOT NULL DEFAULT 'dept_champion',
  `target_department` varchar(100) DEFAULT NULL,
  `invitation_token` varchar(128) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `accepted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guest_invitations_invitation_token_unique` (`invitation_token`),
  KEY `guest_invitations_invited_by_user_id_foreign` (`invited_by_user_id`),
  KEY `guest_invitations_tenant_id_email_index` (`tenant_id`,`email`),
  CONSTRAINT `guest_invitations_invited_by_user_id_foreign` FOREIGN KEY (`invited_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `guest_invitations_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_invitations`
--

LOCK TABLES `guest_invitations` WRITE;
/*!40000 ALTER TABLE `guest_invitations` DISABLE KEYS */;
/*!40000 ALTER TABLE `guest_invitations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `industry_templates`
--

DROP TABLE IF EXISTS `industry_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `industry_templates` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `industry_name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `default_ropa` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`default_ropa`)),
  `default_dpia_triggers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`default_dpia_triggers`)),
  `default_policies` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`default_policies`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `industry_templates_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `industry_templates`
--

LOCK TABLES `industry_templates` WRITE;
/*!40000 ALTER TABLE `industry_templates` DISABLE KEYS */;
INSERT INTO `industry_templates` VALUES (1,'Fintech & Payment Service Providers','fintech-payments','credit-card','Tailored for CBN-licensed PSPs, Mobile Money Operators, Lending Apps, and Digital Wallets under NDPA 2023 & CBN Consumer Protection Framework.','[{\"process_name\":\"Customer Digital Onboarding & KYC \\/ BVN Verification\",\"department\":\"Compliance & Risk\",\"business_purpose\":\"Verification of customer identity to prevent fraud and comply with CBN Anti-Money Laundering (AML\\/CFT) & NDPA guidelines.\",\"legal_basis\":\"legal_obligation\",\"legal_basis_rationale\":\"NDPA Section 25(1)(b) & CBN AML\\/CFT Regulations 2022\",\"data_subject_categories\":[\"Retail Customers\",\"Corporate Directors\",\"Guarantors\"],\"personal_data_elements\":[\"Full Name\",\"Date of Birth\",\"Bank Verification Number (BVN)\",\"National Identification Number (NIN)\",\"Facial Biometric Selfie\",\"Residential Address\",\"Utility Bill\"],\"special_category_data\":true,\"recipients\":[\"Nigeria Inter-Bank Settlement System (NIBSS)\",\"NIMC\",\"Internal Fraud Monitoring Team\"],\"has_third_party_processor\":true,\"third_party_names\":[\"Smile Identity\",\"VerifyMe Nigeria\",\"Amazon Web Services\"],\"cross_border_transfer\":true,\"transfer_destination_countries\":[\"Ireland\",\"United States\"],\"transfer_safeguards\":\"standard_contractual_clauses\",\"storage_location\":\"AWS eu-west-1 (Ireland) Encrypted RDS\",\"retention_period\":\"6 years after account termination (CBN AML standard)\",\"security_measures\":\"AES-256 field-level encryption for BVN\\/NIN, TLS 1.3 in transit, strict RBAC, automated access audit logging\",\"requires_dpia\":true},{\"process_name\":\"Payment Gateway & Card Transaction Processing\",\"department\":\"Engineering & Payments\",\"business_purpose\":\"Facilitating debit\\/credit card charges, fund transfers, and settlement payouts.\",\"legal_basis\":\"contract\",\"legal_basis_rationale\":\"NDPA Section 25(1)(a) Performance of financial services contract\",\"data_subject_categories\":[\"Cardholders\",\"Merchants\",\"Beneficiaries\"],\"personal_data_elements\":[\"Primary Account Number (Masked PAN)\",\"Cardholder Name\",\"Expiry Date\",\"Transaction Amount\",\"IP Address\",\"Device Fingerprint\"],\"special_category_data\":false,\"recipients\":[\"Card Schemes (Visa, Mastercard, Verve)\",\"Acquiring Banks\",\"NIBSS\"],\"has_third_party_processor\":true,\"third_party_names\":[\"Interswitch\",\"Paystack\",\"Flutterwave\"],\"cross_border_transfer\":false,\"storage_location\":\"PCI-DSS Level 1 Compliant Vault (Lagos DC & Dublin)\",\"retention_period\":\"7 years for financial transaction & tax records\",\"security_measures\":\"PCI-DSS Level 1 tokenization, HSM key management, real-time transaction monitoring\",\"requires_dpia\":false},{\"process_name\":\"Automated Credit Scoring & Alternative Data Underwriting\",\"department\":\"Credit & Data Science\",\"business_purpose\":\"Assessing loan eligibility and default probabilities using behavioral and credit bureau history.\",\"legal_basis\":\"consent\",\"legal_basis_rationale\":\"NDPA Section 25(1)(a) Explicit consent required for automated decision profiling\",\"data_subject_categories\":[\"Loan Applicants\"],\"personal_data_elements\":[\"Bank Statement History\",\"Credit Bureau Scores (CRC, FirstCentral)\",\"Device Metadata\",\"SMS Transaction Logs (with consent)\",\"Salary Income\"],\"special_category_data\":false,\"recipients\":[\"Credit Bureaus\",\"Underwriting Team\"],\"has_third_party_processor\":true,\"third_party_names\":[\"Mono Technologies\",\"Okra Inc\",\"CRC Credit Bureau\"],\"cross_border_transfer\":false,\"storage_location\":\"Local Cloud Database\",\"retention_period\":\"5 years post loan liquidation\",\"security_measures\":\"Pseudonymized data lake, restricted algorithmic access, right to human review under NDPA Sec 37\",\"requires_dpia\":true},{\"process_name\":\"Employee Payroll & Tax \\/ Pension Administration\",\"department\":\"Human Resources & Finance\",\"business_purpose\":\"Monthly compensation disbursement, PAYE tax remittance to LIRS\\/FIRS, and PenCom pension remittance.\",\"legal_basis\":\"legal_obligation\",\"legal_basis_rationale\":\"Nigeria Labour Act, Pension Reform Act 2014, and Personal Income Tax Act\",\"data_subject_categories\":[\"Full-time Employees\",\"Contractors\"],\"personal_data_elements\":[\"Full Name\",\"Bank Account Number\",\"Tax ID (TIN)\",\"Pension RSA PIN\",\"Next of Kin Details\",\"Monthly Salary & Deductions\"],\"special_category_data\":false,\"recipients\":[\"Pension Fund Administrators (PFAs)\",\"Lagos State Internal Revenue Service (LIRS)\",\"Commercial Banks\"],\"has_third_party_processor\":true,\"third_party_names\":[\"SeamlessHR\",\"Zenith Bank\"],\"cross_border_transfer\":false,\"storage_location\":\"HR Cloud Portal (Encrypted)\",\"retention_period\":\"7 years following employment termination\",\"security_measures\":\"Role-based access limited to HR & Finance leads, encrypted backups, MFA\",\"requires_dpia\":false},{\"process_name\":\"Customer Care Ticket Resolution & Call Recording\",\"department\":\"Customer Experience\",\"business_purpose\":\"Handling customer disputes, technical inquiries, quality assurance, and training.\",\"legal_basis\":\"legitimate_interest\",\"legal_basis_rationale\":\"Legitimate interest in maintaining service quality and resolving dispute records under NDPA Sec 25(1)(f)\",\"data_subject_categories\":[\"App Users\",\"Callers\"],\"personal_data_elements\":[\"Voice Recording\",\"Customer Name\",\"Email\",\"Chat Transcripts\",\"Account ID\"],\"special_category_data\":false,\"recipients\":[\"Support Agents\",\"QA Team\"],\"has_third_party_processor\":true,\"third_party_names\":[\"Zendesk\",\"Freshworks\",\"Twilio\"],\"cross_border_transfer\":true,\"transfer_destination_countries\":[\"United States\"],\"transfer_safeguards\":\"standard_contractual_clauses\",\"storage_location\":\"Zendesk US Data Center\",\"retention_period\":\"2 years from ticket closure\",\"security_measures\":\"Pre-call consent announcement, encrypted audio files, role-based ticket permissions\",\"requires_dpia\":false}]','[\"Biometric processing (Facial match against NIMC database)\",\"Automated loan approval algorithms without immediate human review\",\"Large scale processing of financial transaction records\"]','[\"Fintech Consumer Privacy Notice\",\"Data Subject Rights Handling Procedure\",\"Cross-Border Financial Data Transfer Standard\"]','2026-09-02 08:34:25','2026-09-02 08:34:25'),(2,'Healthcare, Hospitals & Telemedicine','healthcare-telemedicine','activity','Engineered for hospitals, diagnostic centers, HMOs, and telemedicine platforms handling special category health data under NDPA Sec 30.','[{\"process_name\":\"Patient Medical Records & Electronic Health Record (EHR) Management\",\"department\":\"Clinical Operations & Records\",\"business_purpose\":\"Diagnosis, treatment planning, prescription management, and clinical audit.\",\"legal_basis\":\"vital_interest\",\"legal_basis_rationale\":\"NDPA Section 25(1)(c) & Section 30(1)(c) for Provision of health care services\",\"data_subject_categories\":[\"Patients\",\"Emergency Contacts\",\"Next of Kin\"],\"personal_data_elements\":[\"Full Name\",\"Medical History\",\"Lab & Diagnostic Test Results\",\"Blood Group \\/ Genotype\",\"Prescriptions\",\"Biometric Thumbprint\"],\"special_category_data\":true,\"recipients\":[\"Attending Physicians\",\"Diagnostic Laboratories\",\"Pharmacy Department\"],\"has_third_party_processor\":true,\"third_party_names\":[\"Helium Health\",\"Helium Doc EHR Cloud\"],\"cross_border_transfer\":false,\"storage_location\":\"Encrypted Local Hospital Server & AWS Lagos Local Zone\",\"retention_period\":\"10 years following last patient contact (Federal Ministry of Health standard)\",\"security_measures\":\"Strict doctor-patient confidentiality safeguards, access restricted to assigned care team, audit logging of all chart views\",\"requires_dpia\":true},{\"process_name\":\"HMO Health Insurance Pre-Authorization & Claims Processing\",\"department\":\"Billing & Accounts\",\"business_purpose\":\"Verifying insurance coverage, obtaining procedure pre-authorization, and submitting reimbursement claims.\",\"legal_basis\":\"contract\",\"legal_basis_rationale\":\"NDPA Section 25(1)(a) Execution of healthcare insurance policy contract\",\"data_subject_categories\":[\"Insured Enrollees\"],\"personal_data_elements\":[\"Enrollee Policy Number\",\"Employer Name\",\"ICD-10 Diagnostic Codes\",\"Billed Procedure Amounts\"],\"special_category_data\":true,\"recipients\":[\"Health Maintenance Organizations (HMOs)\",\"National Health Insurance Authority (NHIA)\"],\"has_third_party_processor\":true,\"third_party_names\":[\"Reliance Health\",\"AXA Mansard Health\",\"Hygeia HMO\"],\"cross_border_transfer\":false,\"storage_location\":\"Secured Cloud Portal\",\"retention_period\":\"6 years for insurance claims audit\",\"security_measures\":\"Encrypted EDI claims transmission, role-based access for billing officers\",\"requires_dpia\":false}]','[\"Special category health data and genetic\\/biometric data processing\",\"Telemedicine remote video consultations and recorded diagnostic sessions\"]','[\"Hospital Clinical Data Privacy Notice\",\"Confidentiality & EHR Access Protocol for Medical Personnel\"]','2026-09-02 08:34:25','2026-09-02 08:34:25'),(3,'E-Commerce & Digital Marketplaces','ecommerce-retail','shopping-bag','Designed for online stores, logistics delivery platforms, merchant marketplaces, and direct-to-consumer digital brands.','[{\"process_name\":\"Customer Order Fulfillment & Doorstep Delivery\",\"department\":\"Logistics & Dispatch\",\"business_purpose\":\"Picking, packaging, and dispatching physical orders to buyer delivery addresses.\",\"legal_basis\":\"contract\",\"legal_basis_rationale\":\"NDPA Section 25(1)(a) Fulfillment of commercial sale contract\",\"data_subject_categories\":[\"Online Shoppers\"],\"personal_data_elements\":[\"Full Name\",\"Delivery Address\",\"Phone Number\",\"Order Items\",\"GPS Coordinates\"],\"special_category_data\":false,\"recipients\":[\"Third-party Courier Dispatchers\",\"Fulfillment Center Staff\"],\"has_third_party_processor\":true,\"third_party_names\":[\"GIG Logistics\",\"Kwik Delivery\",\"DHL Nigeria\"],\"cross_border_transfer\":false,\"storage_location\":\"E-Commerce Database (Lagos \\/ Frankfurt)\",\"retention_period\":\"3 years after order completion\",\"security_measures\":\"Masked customer phone numbers for dispatch riders, TLS encryption on driver mobile apps\",\"requires_dpia\":false},{\"process_name\":\"Targeted Marketing, Abandoned Cart Reminders & Newsletters\",\"department\":\"Growth & Digital Marketing\",\"business_purpose\":\"Promoting discounts, remarketing abandoned checkout items, and sending product newsletters.\",\"legal_basis\":\"consent\",\"legal_basis_rationale\":\"NDPA Section 25(1)(a) & GAID rules for electronic direct marketing\",\"data_subject_categories\":[\"Newsletter Subscribers\",\"Website Visitors\"],\"personal_data_elements\":[\"Email Address\",\"Browsing History\",\"Wishlist Items\",\"Purchase History\"],\"special_category_data\":false,\"recipients\":[\"Marketing Automation Platforms\"],\"has_third_party_processor\":true,\"third_party_names\":[\"Mailchimp\",\"Klaviyo\",\"Google Analytics\"],\"cross_border_transfer\":true,\"transfer_destination_countries\":[\"United States\"],\"transfer_safeguards\":\"standard_contractual_clauses\",\"storage_location\":\"US Cloud Server\",\"retention_period\":\"Until consent withdrawal \\/ opt-out\",\"security_measures\":\"1-click unsubscribe mechanism in all promotional emails, cookie consent banner controls\",\"requires_dpia\":false}]','[\"Large scale customer behavioral tracking and algorithmic recommendation engines\",\"Third-party tracking pixel integrations\"]','[\"E-Commerce Website Privacy Notice\",\"Cookie Policy & Opt-out Guide\"]','2026-09-02 08:34:25','2026-09-02 08:34:25'),(4,'Telecommunications & ISPs','telecoms-isps','wifi','Compliant with NCC SIM Registration Regulations and NDPA 2023 for Telcos, Fibre ISPs, and VoIP providers.','[{\"process_name\":\"Subscriber SIM Registration & Biometric Capture\",\"department\":\"Regulatory Affairs & Field Sales\",\"business_purpose\":\"Mandatory subscriber registration and NIN linkage under Nigerian Communications Commission (NCC) rules.\",\"legal_basis\":\"legal_obligation\",\"legal_basis_rationale\":\"NCC SIM Registration Regulations & NDPA Section 25(1)(b)\",\"data_subject_categories\":[\"Subscribers\",\"SIM Agents\"],\"personal_data_elements\":[\"Full Name\",\"10 Fingerprint Biometrics\",\"Facial Portrait\",\"NIN\",\"Residential Address\",\"MSISDN Number\"],\"special_category_data\":true,\"recipients\":[\"NCC Central Repository\",\"NIMC\",\"Law Enforcement (upon valid court warrant)\"],\"has_third_party_processor\":false,\"cross_border_transfer\":false,\"storage_location\":\"National Tier III Data Center (Abuja & Lagos)\",\"retention_period\":\"Duration of active subscription + 5 years post-deactivation\",\"security_measures\":\"End-to-end encrypted biometric capture kits, HSM-backed verification, zero local device storage\",\"requires_dpia\":true}]','[\"Nationwide biometric subscriber database processing\",\"Cell tower location data and call detail record (CDR) analytics\"]','[\"Subscriber Privacy Notice\",\"Law Enforcement Data Request Handling Procedure\"]','2026-09-02 08:34:25','2026-09-02 08:34:25'),(5,'Education & EduTech Platforms','education-edutech','book-open','For universities, private secondary schools, and online learning platforms managing student, parent, and minor records.','[{\"process_name\":\"Student Academic Records, Transcripts & Exam Grading\",\"department\":\"Academic Affairs & Registry\",\"business_purpose\":\"Enrollment, grade point assessment, degree certification, and transcript generation.\",\"legal_basis\":\"contract\",\"legal_basis_rationale\":\"NDPA Section 25(1)(a) Educational enrollment contract\",\"data_subject_categories\":[\"Students\",\"Minors (under 18 with parental consent)\",\"Parents\\/Guardians\"],\"personal_data_elements\":[\"Full Name\",\"Matriculation Number\",\"Birth Certificate\",\"Exam Scores & GPA\",\"Parent Contact Information\",\"Passport Photograph\"],\"special_category_data\":false,\"recipients\":[\"National Universities Commission (NUC)\",\"JAMB\",\"Academic Registry\"],\"has_third_party_processor\":true,\"third_party_names\":[\"Canvas LMS\",\"Google Workspace for Education\"],\"cross_border_transfer\":true,\"transfer_destination_countries\":[\"United States\",\"Ireland\"],\"transfer_safeguards\":\"standard_contractual_clauses\",\"storage_location\":\"Encrypted Educational Cloud\",\"retention_period\":\"Permanent retention for degree verification\",\"security_measures\":\"Parental consent workflows for minor students under NDPA Sec 31, transcript verification encryption\",\"requires_dpia\":false}]','[\"Processing personal data of children and vulnerable learners (NDPA Section 31)\",\"AI-proctored examination monitoring with webcams and screen recording\"]','[\"Student & Parent Privacy Notice\",\"Child Data Protection & Parental Consent Policy\"]','2026-09-02 08:34:25','2026-09-02 08:34:25');
/*!40000 ALTER TABLE `industry_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_tenants_table',1),(2,'0001_01_01_000001_create_users_table',1),(3,'0001_01_01_000002_create_cache_table',1),(4,'0001_01_01_000003_create_jobs_table',1),(5,'2026_08_30_000003_create_tenant_client_organizations_table',1),(6,'2026_08_30_000004_create_industry_templates_table',1),(7,'2026_08_30_000005_create_ropa_activities_table',1),(8,'2026_08_30_000006_create_dpia_assessments_table',1),(9,'2026_08_30_000007_create_audit_projects_table',1),(10,'2026_08_30_000008_create_dsar_requests_table',1),(11,'2026_08_30_000009_create_data_breaches_table',1),(12,'2026_08_30_000010_create_vendors_table',1),(13,'2026_08_30_000011_create_cookie_consent_tables',1),(14,'2026_08_30_000012_create_policies_table',1),(15,'2026_08_30_000013_create_tenant_profiles_tables',1),(16,'2026_08_30_000014_create_subscriptions_and_payments_tables',1),(17,'2026_08_30_000015_create_onboarding_and_classifications_tables',1),(18,'2026_08_30_000016_create_guest_invitations_table',1),(19,'2026_08_30_000017_create_dsar_actions_and_audit_comments_tables',1),(20,'2026_08_30_000018_create_governance_approvals_and_audit_logs_tables',1),(21,'2026_08_30_161955_create_personal_access_tokens_table',1),(22,'2026_09_02_000019_add_capacity_metering_and_parent_relations_to_tenants',1),(23,'2026_09_02_000020_create_ai_decision_logs_table',1),(24,'2026_09_02_000021_create_omnichannel_consents_table',1),(25,'2026_09_02_000022_create_cross_border_transfers_and_breach_playbooks_tables',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('breach_urgent_72h','dsar_sla_urgent','audit_deadline_march15','dpa_missing','approval_request','general') NOT NULL DEFAULT 'general',
  `action_url` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_foreign` (`user_id`),
  KEY `notif_tenant_user_read_idx` (`tenant_id`,`user_id`,`is_read`),
  CONSTRAINT `notifications_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `omnichannel_consents`
--

DROP TABLE IF EXISTS `omnichannel_consents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `omnichannel_consents` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `data_subject_identifier` varchar(255) NOT NULL,
  `channel` enum('ussd_session','sms_shortcode','web_sdk','mobile_app','physical_paper_form','ivr_voice_prompt') NOT NULL DEFAULT 'web_sdk',
  `channel_session_ref` varchar(255) DEFAULT NULL,
  `raw_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`raw_payload`)),
  `consent_categories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consent_categories`)),
  `proof_hash` varchar(64) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `opt_in_timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_withdrawn` tinyint(1) NOT NULL DEFAULT 0,
  `withdrawn_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `omni_tenant_subj_idx` (`tenant_id`,`data_subject_identifier`),
  KEY `omni_tenant_channel_idx` (`tenant_id`,`channel`,`is_withdrawn`),
  CONSTRAINT `omnichannel_consents_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `omnichannel_consents`
--

LOCK TABLES `omnichannel_consents` WRITE;
/*!40000 ALTER TABLE `omnichannel_consents` DISABLE KEYS */;
/*!40000 ALTER TABLE `omnichannel_consents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `onboarding_answers`
--

DROP TABLE IF EXISTS `onboarding_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `onboarding_answers` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `question_id` char(36) NOT NULL,
  `answered_by_user_id` char(36) DEFAULT NULL,
  `response_boolean` tinyint(1) DEFAULT NULL,
  `response_text` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `onboarding_answers_tenant_id_question_id_unique` (`tenant_id`,`question_id`),
  KEY `onboarding_answers_question_id_foreign` (`question_id`),
  KEY `onboarding_answers_answered_by_user_id_foreign` (`answered_by_user_id`),
  CONSTRAINT `onboarding_answers_answered_by_user_id_foreign` FOREIGN KEY (`answered_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `onboarding_answers_question_id_foreign` FOREIGN KEY (`question_id`) REFERENCES `onboarding_questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `onboarding_answers_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `onboarding_answers`
--

LOCK TABLES `onboarding_answers` WRITE;
/*!40000 ALTER TABLE `onboarding_answers` DISABLE KEYS */;
/*!40000 ALTER TABLE `onboarding_answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `onboarding_questions`
--

DROP TABLE IF EXISTS `onboarding_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `onboarding_questions` (
  `id` char(36) NOT NULL,
  `category` varchar(100) NOT NULL,
  `question_text` text NOT NULL,
  `explanation_guide` text DEFAULT NULL,
  `weight_points` int(11) NOT NULL DEFAULT 5,
  `is_mandatory` tinyint(1) NOT NULL DEFAULT 1,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `onboarding_questions`
--

LOCK TABLES `onboarding_questions` WRITE;
/*!40000 ALTER TABLE `onboarding_questions` DISABLE KEYS */;
INSERT INTO `onboarding_questions` VALUES ('01a06254-1148-7107-bb6e-f85fca062a26','Governance & Leadership','Has your organization formally designated a certified Data Protection Officer (DPO) and registered them with the NDPC?','Required under NDPA Section 24 & 32 for Major Data Controllers processing significant volumes of personal data.',10,1,1,'2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-114e-729d-89ac-e770a1a63f40','Inventory & RoPA','Does your organization maintain an up-to-date Record of Processing Activities (RoPA) specifying lawful bases and retention schedules?','Mandated by NDPA Section 24 across all departments handling customer, employee, or vendor data.',10,1,2,'2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-1153-70b6-b42d-33ae188e0bb0','Data Subject Rights','Do you have an established pipeline to fulfill Data Subject Access Requests (DSARs) within the statutory 30-calendar-day SLA?','Pursuant to NDPA Sections 34-38, data subjects have enforceable rights to access, rectify, or erase their records.',10,1,3,'2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-115c-70fc-90d5-51a936b2db24','Incident Response','Is there a documented 72-hour Data Breach Response Protocol for notifying the NDPC upon discovery of a high-risk security breach?','NDPA Section 40 requires notification to the Commission within 72 hours where feasible.',10,1,4,'2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-1161-723d-a831-bc692da472a5','Third-Party Processors','Do all third-party cloud hosting, payment gateway, and software vendors have executed Data Processing Agreements (DPAs)?','NDPA Section 29 requires binding contractual guarantees from all data processors.',10,1,5,'2026-09-02 08:34:31','2026-09-02 08:34:31');
/*!40000 ALTER TABLE `onboarding_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` char(36) NOT NULL,
  `subscription_id` char(36) DEFAULT NULL,
  `tenant_id` char(36) NOT NULL,
  `transaction_reference` varchar(100) NOT NULL,
  `payment_gateway` enum('paystack','flutterwave','bank_transfer') NOT NULL DEFAULT 'paystack',
  `amount_paid` decimal(12,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'NGN',
  `gateway_status` varchar(50) NOT NULL DEFAULT 'successful',
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_transaction_reference_unique` (`transaction_reference`),
  KEY `payments_subscription_id_foreign` (`subscription_id`),
  KEY `payments_tenant_id_paid_at_index` (`tenant_id`,`paid_at`),
  CONSTRAINT `payments_subscription_id_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payments_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` char(36) NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User','01a06254-08f8-7226-8e76-ea82f458bb00','auth-token','0938e0db3f27b33c8cb9bdea81eb659ed620d4fbbd9ad9bccb07d995f1c20c6e','[\"*\"]','2026-09-02 08:38:30','2026-09-02 20:38:25','2026-09-02 08:38:26','2026-09-02 08:38:30'),(4,'App\\Models\\User','01a06254-08f8-7226-8e76-ea82f458bb00','auth-token','b334c3ac9806a7e6a934274300701dd86915616ece030bc994b58eb7362e5b08','[\"*\"]','2026-09-02 09:19:51','2026-09-02 20:42:50','2026-09-02 08:42:50','2026-09-02 09:19:51');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `policies`
--

DROP TABLE IF EXISTS `policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `policies` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('privacy_notice_website','employee_privacy_policy','data_retention_schedule','incident_response_policy','data_protection_agreement_dpa','cctv_surveillance_policy') NOT NULL,
  `content` longtext NOT NULL,
  `version` varchar(255) NOT NULL DEFAULT '1.0',
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `published_at` timestamp NULL DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `policies_created_by_foreign` (`created_by`),
  KEY `policies_tenant_id_type_status_index` (`tenant_id`,`type`,`status`),
  CONSTRAINT `policies_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `policies_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `policies`
--

LOCK TABLES `policies` WRITE;
/*!40000 ALTER TABLE `policies` DISABLE KEYS */;
INSERT INTO `policies` VALUES ('01a06254-1118-7362-9977-cae9a958c161','65ec75a3-5d0c-4119-9a3d-4033966725cc','Apex MFB Customer Privacy Notice (NDPA 2023 Compliant)','privacy_notice_website','## APEX MICROFINANCE BANK NIGERIA LIMITED\n### CUSTOMER PRIVACY NOTICE (NDPA 2023)\n\n**1. INTRODUCTION**\nApex Microfinance Bank Ltd (\"Apex MFB\", \"we\", \"us\") is committed to safeguarding the personal data of our customers, depositors, loan applicants, and visitors in full compliance with the Nigeria Data Protection Act 2023 (NDPA) and directives of the Nigeria Data Protection Commission (NDPC).\n\n**2. DATA WE COLLECT**\n- Identity Data: Full Name, Date of Birth, BVN, NIN, Passport photo, Facial biometrics.\n- Contact Data: Residential address, Email, Phone number.\n- Financial Data: Bank account records, card tokens, transaction history, loan balances.\n\n**3. LEGAL BASES FOR PROCESSING (NDPA SECTION 25)**\n- Performance of Banking Contract (Section 25(1)(a))\n- Compliance with Legal Obligations under CBN AML/CFT Regulations (Section 25(1)(b))\n- Consent for marketing and automated credit profiling (Section 25(1)(a))\n\n**4. DATA SUBJECT RIGHTS (NDPA SECTIONS 34-38)**\nYou have the right to request access to your records, rectify inaccurate data, request erasure where applicable, object to direct marketing, and request human review of automated credit scoring decisions.\n\n**5. CONTACT OUR DATA PROTECTION OFFICER**\nEmail: dpo@apexmfb.ng | Phone: +2348034567890 | Address: Plot 12, Adeola Odeku St, Victoria Island, Lagos.','1.0','published','2026-08-18 08:34:31','01a06254-0a25-713b-90c3-cda9f16943dc','2026-09-02 08:34:31','2026-09-02 08:34:31');
/*!40000 ALTER TABLE `policies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ropa_activities`
--

DROP TABLE IF EXISTS `ropa_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ropa_activities` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `process_name` varchar(255) NOT NULL,
  `department` varchar(255) NOT NULL,
  `business_purpose` text NOT NULL,
  `legal_basis` enum('consent','contract','legal_obligation','vital_interest','public_interest','legitimate_interest') NOT NULL,
  `legal_basis_rationale` text DEFAULT NULL,
  `data_subject_categories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data_subject_categories`)),
  `personal_data_elements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`personal_data_elements`)),
  `special_category_data` tinyint(1) NOT NULL DEFAULT 0,
  `recipients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recipients`)),
  `has_third_party_processor` tinyint(1) NOT NULL DEFAULT 0,
  `third_party_names` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`third_party_names`)),
  `cross_border_transfer` tinyint(1) NOT NULL DEFAULT 0,
  `transfer_destination_countries` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`transfer_destination_countries`)),
  `transfer_safeguards` enum('adequacy_decision','ndpc_approved_bcr','standard_contractual_clauses','explicit_consent','none') DEFAULT NULL,
  `storage_location` varchar(255) NOT NULL DEFAULT 'Local Server / Cloud',
  `retention_period` varchar(255) NOT NULL DEFAULT '6 years after account termination',
  `security_measures` text DEFAULT NULL,
  `requires_dpia` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('draft','reviewed_by_dept','verified_by_dpo','approved_active') NOT NULL DEFAULT 'draft',
  `reviewed_by` char(36) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ropa_activities_reviewed_by_foreign` (`reviewed_by`),
  KEY `ropa_activities_tenant_id_department_status_index` (`tenant_id`,`department`,`status`),
  CONSTRAINT `ropa_activities_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ropa_activities_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ropa_activities`
--

LOCK TABLES `ropa_activities` WRITE;
/*!40000 ALTER TABLE `ropa_activities` DISABLE KEYS */;
INSERT INTO `ropa_activities` VALUES ('01a06254-0f09-7265-b6f2-d9918e50a7e0','65ec75a3-5d0c-4119-9a3d-4033966725cc','Mobile App Digital Onboarding & KYC (BVN/NIN Verification)','Compliance & Risk','Customer identification and verification in compliance with CBN AML/CFT 2022 and NDPA 2023 regulations.','legal_obligation','NDPA Section 25(1)(b) & CBN AML/CFT Regulations','[\"Retail Bank Customers\",\"Account Signatories\"]','[\"Full Name\",\"BVN\",\"NIN\",\"Facial Biometric Selfie\",\"Residential Address\",\"Date of Birth\"]',1,'[\"NIBSS\",\"NIMC\",\"Fraud Analytics Unit\"]',1,'[\"Smile Identity\",\"AWS Ireland\"]',1,'[\"Ireland\"]','standard_contractual_clauses','AWS eu-west-1 (Ireland) Encrypted DB','6 years after account closure','AES-256 field level encryption, TLS 1.3, strict IAM roles, periodic key rotation',1,'approved_active','01a06254-0a25-713b-90c3-cda9f16943dc','2026-08-21 08:34:31','2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-0f10-720a-a46e-c3b9a9812f38','65ec75a3-5d0c-4119-9a3d-4033966725cc','Debit Card Issuance & NIBSS Instant Settlement','Treasury & Payments','Processing POS transactions, ATM withdrawals, and web payments across Nigeria.','contract','NDPA Section 25(1)(a) Performance of cardholder agreement','[\"Cardholders\"]','[\"Masked PAN\",\"Cardholder Name\",\"Expiry Date\",\"Transaction Amounts\",\"Terminal ID\"]',0,'[\"Interswitch\",\"Mastercard Scheme\",\"NIBSS\"]',1,'[\"Interswitch Nigeria\",\"Paystack\"]',0,NULL,NULL,'Tier III Lagos Data Center','7 years for CBN financial ledger standards','PCI-DSS Level 1 compliance, HSM encryption, 3D Secure 2.0 OTP',0,'approved_active','01a06254-0a25-713b-90c3-cda9f16943dc','2026-08-23 08:34:31','2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-0f16-729c-acd4-2007612ad3db','65ec75a3-5d0c-4119-9a3d-4033966725cc','AI Micro-Loan Underwriting & Behavioral Credit Profiling','Credit & Data Science','Automated risk scoring to approve instant mobile loans up to N500,000 without collateral.','consent','NDPA Section 25(1)(a) Explicit consent for automated profile decisioning','[\"Loan Applicants\"]','[\"Credit Bureau Records\",\"Bank Statement Aggregates\",\"Device Telemetry\",\"SMS Financial Alerts (Consented)\"]',0,'[\"Credit Bureaus (CRC, FirstCentral)\"]',1,'[\"Mono Technologies\",\"Okra\"]',0,NULL,NULL,'Lagos Hybrid Cloud','5 years post full loan liquidation','Pseudonymized data lake, model explainability logs, human appeal mechanism',1,'verified_by_dpo','01a06254-0a25-713b-90c3-cda9f16943dc',NULL,'2026-09-02 08:34:31','2026-09-02 08:34:31');
/*!40000 ALTER TABLE `ropa_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`),
  CONSTRAINT `sessions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subscriptions` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `plan_tier` enum('starter_corporate','growth_enterprise','dpo_unlimited','dpco_audit_suite') NOT NULL DEFAULT 'starter_corporate',
  `billing_cycle` enum('monthly','annual') NOT NULL DEFAULT 'annual',
  `price_ngn` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('active','past_due','cancelled','trialing') NOT NULL DEFAULT 'trialing',
  `current_period_start` timestamp NULL DEFAULT NULL,
  `current_period_end` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subscriptions_tenant_id_status_index` (`tenant_id`,`status`),
  CONSTRAINT `subscriptions_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
INSERT INTO `subscriptions` VALUES ('01a06254-07e3-70df-b29d-c7a1800e4efc','65ec75a3-5d0c-4119-9a3d-4033966725cc','growth_enterprise','annual',1500000.00,'active','2025-12-31 19:00:00','2026-12-31 18:59:59','2026-09-02 08:34:29','2026-09-02 08:34:29');
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_client_organizations`
--

DROP TABLE IF EXISTS `tenant_client_organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenant_client_organizations` (
  `id` char(36) NOT NULL,
  `parent_tenant_id` char(36) NOT NULL,
  `client_tenant_id` char(36) NOT NULL,
  `contract_ref` varchar(255) DEFAULT NULL,
  `service_scope` enum('annual_audit_filing','full_dpo_as_a_service','advisory_gap_assessment','incident_response_support') NOT NULL DEFAULT 'annual_audit_filing',
  `assigned_lead_auditor_id` char(36) DEFAULT NULL,
  `status` enum('active','pending_approval','completed','suspended') NOT NULL DEFAULT 'active',
  `engagement_start_date` date DEFAULT NULL,
  `engagement_end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tco_parent_client_unique` (`parent_tenant_id`,`client_tenant_id`),
  KEY `tenant_client_organizations_assigned_lead_auditor_id_foreign` (`assigned_lead_auditor_id`),
  KEY `tenant_client_organizations_client_tenant_id_foreign` (`client_tenant_id`),
  CONSTRAINT `tenant_client_organizations_assigned_lead_auditor_id_foreign` FOREIGN KEY (`assigned_lead_auditor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tenant_client_organizations_client_tenant_id_foreign` FOREIGN KEY (`client_tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tenant_client_organizations_parent_tenant_id_foreign` FOREIGN KEY (`parent_tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_client_organizations`
--

LOCK TABLES `tenant_client_organizations` WRITE;
/*!40000 ALTER TABLE `tenant_client_organizations` DISABLE KEYS */;
INSERT INTO `tenant_client_organizations` VALUES ('01a06254-0eb1-73e0-ba7c-caa430036d83','70cb4a9e-ff09-4905-ab6d-f5ab7d26677e','65ec75a3-5d0c-4119-9a3d-4033966725cc','DPCO-2026-APX-01','annual_audit_filing','01a06254-0c9e-7132-94af-a3aa7846f36b','active','2026-01-10','2026-12-31','2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-0eb9-7267-b759-911ff9a45f96','70cb4a9e-ff09-4905-ab6d-f5ab7d26677e','09d36345-8869-4fc8-a670-15d743fb8877','DPCO-2026-HLT-02','annual_audit_filing','01a06254-0c9e-7132-94af-a3aa7846f36b','active','2026-02-01','2026-12-31','2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-0ebd-7006-b230-42d11308641e','58e16bd6-5a2a-417a-861a-1c8ddb3c4bb2','65ec75a3-5d0c-4119-9a3d-4033966725cc','DPOaaS-2026-APX','full_dpo_as_a_service','01a06254-0b69-70bc-931e-77212d34d22d','active','2026-01-01','2026-12-31','2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-0ec2-72ea-903a-25b2bbe6c806','58e16bd6-5a2a-417a-861a-1c8ddb3c4bb2','9e2da984-7733-4861-be64-0a3f7b57e6e8','DPOaaS-2026-SWF','full_dpo_as_a_service','01a06254-0b69-70bc-931e-77212d34d22d','active','2026-01-15','2026-12-31','2026-09-02 08:34:31','2026-09-02 08:34:31');
/*!40000 ALTER TABLE `tenant_client_organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenants` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `type` enum('corporate','outsourced_dpo','dpco_firm') NOT NULL DEFAULT 'corporate',
  `parent_tenant_id` char(36) DEFAULT NULL,
  `tenant_tier` enum('independent_corporate','parent_holding_group','dpo_agency_hub','dpco_audit_practice','sub_workspace_client') NOT NULL DEFAULT 'independent_corporate',
  `industry` varchar(255) DEFAULT NULL,
  `rc_number` varchar(255) DEFAULT NULL,
  `ndpc_registration_number` varchar(255) DEFAULT NULL,
  `dpco_license_number` varchar(255) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `data_residency` enum('local_nigeria','global_aws') NOT NULL DEFAULT 'local_nigeria',
  `compliance_score` decimal(5,2) NOT NULL DEFAULT 0.00,
  `feature_flags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`feature_flags`)),
  `data_subject_quota` int(11) NOT NULL DEFAULT 50000,
  `monthly_dsar_limit` int(11) NOT NULL DEFAULT 50,
  `monthly_breach_limit` int(11) NOT NULL DEFAULT 10,
  `usage_metrics` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`usage_metrics`)),
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenants_slug_unique` (`slug`),
  KEY `tenants_type_is_active_data_residency_index` (`type`,`is_active`,`data_residency`),
  KEY `tenants_parent_tier_idx` (`parent_tenant_id`,`tenant_tier`),
  CONSTRAINT `tenants_parent_tenant_id_foreign` FOREIGN KEY (`parent_tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES ('09d36345-8869-4fc8-a670-15d743fb8877','HealthPoint Telemedicine Nigeria Ltd','healthpoint-ng','corporate',NULL,'independent_corporate','Healthcare, Hospitals & Telemedicine','RC-1678234',NULL,NULL,NULL,NULL,NULL,'Lagos','local_nigeria',64.00,NULL,50000,50,10,NULL,NULL,1,'2026-09-02 08:34:31','2026-09-02 08:34:31'),('58e16bd6-5a2a-417a-861a-1c8ddb3c4bb2','Fortress Data Protection Advisory LLP','fortress-dpo','outsourced_dpo',NULL,'independent_corporate','Legal & Compliance Consulting','RC-2049182',NULL,NULL,'contact@fortressadvisory.ng','+2348055667788','8th Floor, Churchgate Tower, Central Business District','Abuja FCT','local_nigeria',0.00,NULL,50000,50,10,NULL,NULL,1,'2026-09-02 08:34:29','2026-09-02 08:34:29'),('65ec75a3-5d0c-4119-9a3d-4033966725cc','Apex Microfinance Bank Nigeria Ltd','apex-mfb','corporate',NULL,'independent_corporate','Fintech & Payment Service Providers','RC-1489201','NDPC/DCMI/2026/0891',NULL,'compliance@apexmfb.ng','+2348023456789','Plot 12, Adeola Odeku Street, Victoria Island','Lagos','local_nigeria',78.50,NULL,50000,50,10,NULL,'{\"primary_color\":\"#059669\",\"logo_url\":\"\\/logos\\/apex-logo.svg\",\"notify_on_breach\":true,\"notify_on_dsar\":true}',1,'2026-09-02 08:34:29','2026-09-02 08:34:29'),('70cb4a9e-ff09-4905-ab6d-f5ab7d26677e','Vanguard Compliance & Audit Partners DPCO','vanguard-dpco','dpco_firm',NULL,'independent_corporate','Audit, Assurance & DPCO Certification','RC-993812',NULL,'NDPC/DPCO/2026/042','audit@vanguarddpco.ng','+2348077889900','24A Glover Road, Ikoyi','Lagos','local_nigeria',0.00,NULL,50000,50,10,NULL,NULL,1,'2026-09-02 08:34:30','2026-09-02 08:34:30'),('9e2da984-7733-4861-be64-0a3f7b57e6e8','SwiftExpress Logistics Global Services','swiftexpress-ng','corporate',NULL,'independent_corporate','E-Commerce & Digital Marketplaces','RC-1554902',NULL,NULL,NULL,NULL,NULL,'Rivers','local_nigeria',88.00,NULL,50000,50,10,NULL,NULL,1,'2026-09-02 08:34:31','2026-09-02 08:34:31');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','dpco_lead_auditor','dpco_staff','outsourced_dpo','corporate_admin','compliance_officer','dept_champion','auditor_viewer') NOT NULL DEFAULT 'corporate_admin',
  `department` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_tenant_id_role_index` (`tenant_id`,`role`),
  CONSTRAINT `users_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('01a06254-069c-7260-9425-b15d1d41e48e',NULL,'System Administrator','admin@dpodpco.ng',NULL,'$2y$12$5lIV0nGx19UXvtD4oMTWWeSS.Na1TbSgKQ7xbkfLbNkJ14l9UrZgi','super_admin','Executive','+2348011223344',NULL,1,NULL,'2026-09-02 08:34:29','2026-09-02 08:34:29'),('01a06254-08f8-7226-8e76-ea82f458bb00','65ec75a3-5d0c-4119-9a3d-4033966725cc','Tunde Bakare','compliance@apexmfb.ng',NULL,'$2y$12$cE1LzJ3lB9mvHsEo2nH9yOtjSkMLzFGblH/hQixB7U0mdfdv9/OI6','corporate_admin','Compliance & Legal','+2348023456789',NULL,1,NULL,'2026-09-02 08:34:29','2026-09-02 08:34:29'),('01a06254-0a25-713b-90c3-cda9f16943dc','65ec75a3-5d0c-4119-9a3d-4033966725cc','Amina Bello (Internal DPO)','dpo@apexmfb.ng',NULL,'$2y$12$0aoAN2UivqqCbCvpyA5EeOwhg3ACILDThCnJ9iI69B6Zu0KdIHVmu','compliance_officer','Risk & Compliance','+2348034567890',NULL,1,NULL,'2026-09-02 08:34:29','2026-09-02 08:34:29'),('01a06254-0b69-70bc-931e-77212d34d22d','58e16bd6-5a2a-417a-861a-1c8ddb3c4bb2','Barrister Chukwuma Obi (Lead DPO)','lead.dpo@fortressadvisory.ng',NULL,'$2y$12$f8oxGJJBDdSYKSbnnyy6G.l.FicIlpucDCBDdkFpoy2tyFoVb.Ss.','outsourced_dpo','DPO Advisory Practice','+2348055667788',NULL,1,NULL,'2026-09-02 08:34:30','2026-09-02 08:34:30'),('01a06254-0c9e-7132-94af-a3aa7846f36b','70cb4a9e-ff09-4905-ab6d-f5ab7d26677e','Dr. Folake Adeleke (Managing DPCO Partner)','lead.partner@vanguarddpco.ng',NULL,'$2y$12$Mh8XAdzovrInJmWoTP3I7urf.dnXvmHqfafbeyraTH1dz7c.UUfFi','dpco_lead_auditor','Statutory Audit Practice','+2348077889900',NULL,1,NULL,'2026-09-02 08:34:30','2026-09-02 08:34:30'),('01a06254-0e83-70c4-a452-f29595633c1e','70cb4a9e-ff09-4905-ab6d-f5ab7d26677e','Emeka Nwosu (Senior Auditor)','auditor1@vanguarddpco.ng',NULL,'$2y$12$gbMuT3rEXd/WosXSnAryme1D9nY3wa5p6BodiCFaBGK0ocZDCaFhW','dpco_staff','Assurance & Fieldwork','+2348088990011',NULL,1,NULL,'2026-09-02 08:34:31','2026-09-02 08:34:31');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vendors` (
  `id` char(36) NOT NULL,
  `tenant_id` char(36) NOT NULL,
  `vendor_name` varchar(255) NOT NULL,
  `service_category` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(255) DEFAULT NULL,
  `data_types_processed` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data_types_processed`)),
  `dpa_signed` tinyint(1) NOT NULL DEFAULT 0,
  `dpa_signed_date` date DEFAULT NULL,
  `dpa_file_path` varchar(255) DEFAULT NULL,
  `risk_rating` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `hosting_country` varchar(255) NOT NULL DEFAULT 'Nigeria',
  `is_cross_border` tinyint(1) NOT NULL DEFAULT 0,
  `last_assessment_date` date DEFAULT NULL,
  `status` enum('active','under_review','terminated') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vendors_tenant_risk_dpa_idx` (`tenant_id`,`risk_rating`,`dpa_signed`),
  CONSTRAINT `vendors_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
INSERT INTO `vendors` VALUES ('01a06254-1060-7059-86c0-98628446f9d0','65ec75a3-5d0c-4119-9a3d-4033966725cc','Smile Identity Nigeria Ltd','Biometric KYC & Identity Verification','Segun Alabi','partnerships@smileidentity.com',NULL,'[\"NIN\",\"BVN\",\"Facial Biometric Selfies\",\"Full Names\"]',1,'2025-11-15',NULL,'low','Ireland / Nigeria',1,'2026-01-20','active','2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-1067-73a4-891a-cf39a834bff9','65ec75a3-5d0c-4119-9a3d-4033966725cc','Paystack Payments Ltd','Payment Gateway & Card Tokenization','Folashade Wright','compliance@paystack.com',NULL,'[\"Card Tokens\",\"Account Numbers\",\"Email Addresses\",\"Transaction Amounts\"]',1,'2025-12-01',NULL,'low','Nigeria',0,'2026-02-10','active','2026-09-02 08:34:31','2026-09-02 08:34:31'),('01a06254-106c-72e7-94b9-080bb63c297f','65ec75a3-5d0c-4119-9a3d-4033966725cc','Infobip Global Messaging','Transactional SMS & OTP Delivery','David Mensah','support@infobip.com',NULL,'[\"Customer Phone Numbers\",\"SMS Text Messages\"]',0,NULL,NULL,'high','United Kingdom',1,'2026-01-05','under_review','2026-09-02 08:34:31','2026-09-02 08:34:31');
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-22  0:13:26
