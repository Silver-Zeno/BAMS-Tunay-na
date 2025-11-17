-- BAMS (Barangay Appointment Management System) MySQL schema
-- Charset/Collation
CREATE DATABASE IF NOT EXISTS `bams` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `bams`;

-- Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role` ENUM('admin','resident') NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `address` VARCHAR(255) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `ix_users_role` (`role`)
) ENGINE=InnoDB;

-- Services offered by barangay (e.g., Barangay Clearance, Certificate of Residency)
CREATE TABLE IF NOT EXISTS `services` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `description` TEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_services_name` (`name`),
  KEY `ix_services_active` (`is_active`)
) ENGINE=InnoDB;

-- Appointment slots (optional scheduling windows configured by admin)
CREATE TABLE IF NOT EXISTS `appointment_slots` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `service_id` BIGINT UNSIGNED NOT NULL,
  `slot_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `capacity` INT NOT NULL DEFAULT 1,
  `booked_count` INT NOT NULL DEFAULT 0,
  `status` ENUM('open','closed') NOT NULL DEFAULT 'open',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_slots_service_date` (`service_id`, `slot_date`),
  CONSTRAINT `fk_slots_service` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Appointments
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reference_no` VARCHAR(30) NOT NULL,
  `resident_id` BIGINT UNSIGNED NOT NULL,
  `service_id` BIGINT UNSIGNED NOT NULL,
  `slot_id` BIGINT UNSIGNED NULL,
  `preferred_datetime` DATETIME NULL,
  `status` ENUM('pending','approved','rejected','cancelled','completed') NOT NULL DEFAULT 'pending',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_appointments_ref` (`reference_no`),
  KEY `ix_appt_resident` (`resident_id`),
  KEY `ix_appt_service` (`service_id`),
  KEY `ix_appt_slot` (`slot_id`),
  KEY `ix_appt_status` (`status`),
  CONSTRAINT `fk_appt_resident` FOREIGN KEY (`resident_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_appt_service` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_appt_slot` FOREIGN KEY (`slot_id`) REFERENCES `appointment_slots`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Appointment logs (audit trail)
CREATE TABLE IF NOT EXISTS `appointment_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `appointment_id` BIGINT UNSIGNED NOT NULL,
  `actor_user_id` BIGINT UNSIGNED NULL,
  `action` VARCHAR(50) NOT NULL,
  `message` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_logs_appt` (`appointment_id`),
  CONSTRAINT `fk_logs_appt` FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_logs_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Documents uploaded for an appointment
CREATE TABLE IF NOT EXISTS `documents` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `appointment_id` BIGINT UNSIGNED NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `size_bytes` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_docs_appt` (`appointment_id`),
  CONSTRAINT `fk_docs_appt` FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Seed: example services
INSERT INTO `services` (`name`, `description`) VALUES
  ('Barangay Clearance', 'Clearance for various purposes'),
  ('Certificate of Residency', 'Proof of residency'),
  ('Barangay ID', 'Issuance of Barangay Identification card')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);
