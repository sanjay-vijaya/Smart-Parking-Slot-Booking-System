-- MySQL Database Schema for Smart Parking Slot Booking System
-- Run this script in MySQL to create the database and tables

-- Create database
CREATE DATABASE IF NOT EXISTS parking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE parking_system;

-- Create slots table
CREATE TABLE IF NOT EXISTS slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slot_number INT UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slot_number (slot_number),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slot_id INT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL,
    aadhaar_number VARCHAR(12) NOT NULL,
    booking_date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    image_path VARCHAR(255) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE,
    INDEX idx_slot_id (slot_id),
    INDEX idx_customer_email (customer_email),
    INDEX idx_booking_date (booking_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial slots (numbered 1 to 50)
INSERT INTO slots (slot_number, status) VALUES
(1, 'available'),
(2, 'available'),
(3, 'available'),
(4, 'available'),
(5, 'available'),
(6, 'available'),
(7, 'available'),
(8, 'available'),
(9, 'available'),
(10, 'available'),
(11, 'available'),
(12, 'available'),
(13, 'available'),
(14, 'available'),
(15, 'available'),
(16, 'available'),
(17, 'available'),
(18, 'available'),
(19, 'available'),
(20, 'available'),
(21, 'available'),
(22, 'available'),
(23, 'available'),
(24, 'available'),
(25, 'available'),
(26, 'available'),
(27, 'available'),
(28, 'available'),
(29, 'available'),
(30, 'available'),
(31, 'available'),
(32, 'available'),
(33, 'available'),
(34, 'available'),
(35, 'available'),
(36, 'available'),
(37, 'available'),
(38, 'available'),
(39, 'available'),
(40, 'available'),
(41, 'available'),
(42, 'available'),
(43, 'available'),
(44, 'available'),
(45, 'available'),
(46, 'available'),
(47, 'available'),
(48, 'available'),
(49, 'available'),
(50, 'available')
ON DUPLICATE KEY UPDATE slot_number=slot_number;

-- Verify tables were created
SHOW TABLES;

-- View slots table structure
DESCRIBE slots;

-- View bookings table structure
DESCRIBE bookings;

