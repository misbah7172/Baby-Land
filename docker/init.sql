-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS baby_land;

-- Create user if it doesn't exist
CREATE USER IF NOT EXISTS 'baby_land'@'%' IDENTIFIED BY 'baby_land_password';

-- Grant all privileges to the user
GRANT ALL PRIVILEGES ON baby_land.* TO 'baby_land'@'%';

-- Also allow localhost connection
CREATE USER IF NOT EXISTS 'baby_land'@'localhost' IDENTIFIED BY 'baby_land_password';
GRANT ALL PRIVILEGES ON baby_land.* TO 'baby_land'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Use the database
USE baby_land;

-- Create a simple test table to verify connection
CREATE TABLE IF NOT EXISTS _prisma_migrations (
    id VARCHAR(36) PRIMARY KEY,
    checksum VARCHAR(64) NOT NULL,
    finished_at DATETIME,
    execution_time BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    logs LONGTEXT,
    rolled_back_at DATETIME,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    applied_steps_count INT NOT NULL DEFAULT 0
);
