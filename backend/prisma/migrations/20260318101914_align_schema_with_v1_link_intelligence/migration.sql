/*
  Warnings:

  - You are about to drop the `dashboard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dashboardmetric` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `datasource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `metric` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `metricsnapshot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workspace` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workspacemember` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Dashboard` DROP FOREIGN KEY `Dashboard_created_by_id_fkey`;

-- DropForeignKey
ALTER TABLE `Dashboard` DROP FOREIGN KEY `Dashboard_workspace_id_fkey`;

-- DropForeignKey
ALTER TABLE `DashboardMetric` DROP FOREIGN KEY `DashboardMetric_dashboard_id_fkey`;

-- DropForeignKey
ALTER TABLE `DashboardMetric` DROP FOREIGN KEY `DashboardMetric_metric_id_fkey`;

-- DropForeignKey
ALTER TABLE `DataSource` DROP FOREIGN KEY `DataSource_workspace_id_fkey`;

-- DropForeignKey
ALTER TABLE `Metric` DROP FOREIGN KEY `Metric_created_by_id_fkey`;

-- DropForeignKey
ALTER TABLE `Metric` DROP FOREIGN KEY `Metric_data_source_id_fkey`;

-- DropForeignKey
ALTER TABLE `Metric` DROP FOREIGN KEY `Metric_workspace_id_fkey`;

-- DropForeignKey
ALTER TABLE `MetricSnapshot` DROP FOREIGN KEY `MetricSnapshot_metric_id_fkey`;

-- DropForeignKey
ALTER TABLE `Workspace` DROP FOREIGN KEY `Workspace_owner_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `WorkspaceMember` DROP FOREIGN KEY `WorkspaceMember_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `WorkspaceMember` DROP FOREIGN KEY `WorkspaceMember_workspace_id_fkey`;

-- DropTable
DROP TABLE `Dashboard`;

-- DropTable
DROP TABLE `DashboardMetric`;

-- DropTable
DROP TABLE `DataSource`;

-- DropTable
DROP TABLE `Metric`;

-- DropTable
DROP TABLE `MetricSnapshot`;

-- DropTable
DROP TABLE `Workspace`;

-- DropTable
DROP TABLE `WorkspaceMember`;

-- CreateTable
CREATE TABLE `ApiKey` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `key_prefix` VARCHAR(191) NOT NULL,
    `key_hash` VARCHAR(191) NOT NULL,
    `requests_per_minute` INTEGER NOT NULL DEFAULT 60,
    `last_used_at` DATETIME(3) NULL,
    `revoked_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ApiKey_key_hash_key`(`key_hash`),
    INDEX `ApiKey_user_id_revoked_at_idx`(`user_id`, `revoked_at`),
    INDEX `ApiKey_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsageRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `api_key_id` INTEGER NOT NULL,
    `usage_date` DATE NOT NULL,
    `request_count` INTEGER NOT NULL DEFAULT 0,
    `cache_hits` INTEGER NOT NULL DEFAULT 0,
    `cache_misses` INTEGER NOT NULL DEFAULT 0,
    `error_count` INTEGER NOT NULL DEFAULT 0,
    `total_latency_ms` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `UsageRecord_user_id_usage_date_idx`(`user_id`, `usage_date`),
    UNIQUE INDEX `UsageRecord_api_key_id_usage_date_key`(`api_key_id`, `usage_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequestLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `request_id` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `api_key_id` INTEGER NOT NULL,
    `url` TEXT NOT NULL,
    `normalized_url` TEXT NULL,
    `canonical_url` TEXT NULL,
    `domain` VARCHAR(191) NULL,
    `method` VARCHAR(191) NOT NULL DEFAULT 'GET',
    `endpoint` VARCHAR(191) NOT NULL,
    `status_code` INTEGER NOT NULL,
    `latency_ms` INTEGER NOT NULL,
    `cache_hit` BOOLEAN NOT NULL DEFAULT false,
    `content_type` VARCHAR(191) NULL,
    `error_code` ENUM('INVALID_URL', 'RATE_LIMITED', 'FETCH_TIMEOUT', 'FETCH_FAILED', 'PARSE_FAILED', 'UPSTREAM_ERROR', 'INTERNAL_ERROR') NULL,
    `requested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RequestLog_request_id_key`(`request_id`),
    INDEX `RequestLog_user_id_requested_at_idx`(`user_id`, `requested_at`),
    INDEX `RequestLog_api_key_id_requested_at_idx`(`api_key_id`, `requested_at`),
    INDEX `RequestLog_domain_requested_at_idx`(`domain`, `requested_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BillingCycle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `request_count` INTEGER NOT NULL DEFAULT 0,
    `cache_hits` INTEGER NOT NULL DEFAULT 0,
    `cache_misses` INTEGER NOT NULL DEFAULT 0,
    `billable_requests` INTEGER NOT NULL DEFAULT 0,
    `estimated_cost_cents` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('OPEN', 'CLOSED', 'INVOICED') NOT NULL DEFAULT 'OPEN',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `BillingCycle_user_id_status_idx`(`user_id`, `status`),
    UNIQUE INDEX `BillingCycle_user_id_period_start_period_end_key`(`user_id`, `period_start`, `period_end`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ApiKey` ADD CONSTRAINT `ApiKey_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsageRecord` ADD CONSTRAINT `UsageRecord_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsageRecord` ADD CONSTRAINT `UsageRecord_api_key_id_fkey` FOREIGN KEY (`api_key_id`) REFERENCES `ApiKey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestLog` ADD CONSTRAINT `RequestLog_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestLog` ADD CONSTRAINT `RequestLog_api_key_id_fkey` FOREIGN KEY (`api_key_id`) REFERENCES `ApiKey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillingCycle` ADD CONSTRAINT `BillingCycle_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
