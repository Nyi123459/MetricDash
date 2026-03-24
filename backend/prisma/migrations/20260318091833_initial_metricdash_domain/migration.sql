-- AlterTable
ALTER TABLE `User` ADD COLUMN `name` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Workspace` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `owner_user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Workspace_slug_key`(`slug`),
    INDEX `Workspace_owner_user_id_idx`(`owner_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkspaceMember` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workspace_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `role` ENUM('OWNER', 'ADMIN', 'MEMBER', 'VIEWER') NOT NULL DEFAULT 'MEMBER',
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `WorkspaceMember_user_id_idx`(`user_id`),
    UNIQUE INDEX `WorkspaceMember_workspace_id_user_id_key`(`workspace_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DataSource` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workspace_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('MYSQL', 'POSTGRES', 'STRIPE', 'GOOGLE_ANALYTICS', 'MANUAL') NOT NULL,
    `status` ENUM('ACTIVE', 'DISCONNECTED', 'ERROR') NOT NULL DEFAULT 'ACTIVE',
    `config_json` JSON NULL,
    `last_synced_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `DataSource_workspace_id_status_idx`(`workspace_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dashboard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workspace_id` INTEGER NOT NULL,
    `created_by_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `is_archived` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Dashboard_workspace_id_is_archived_idx`(`workspace_id`, `is_archived`),
    UNIQUE INDEX `Dashboard_workspace_id_slug_key`(`workspace_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Metric` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workspace_id` INTEGER NOT NULL,
    `data_source_id` INTEGER NULL,
    `created_by_id` INTEGER NULL,
    `name` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `query_text` TEXT NULL,
    `aggregation` ENUM('SUM', 'COUNT', 'AVG', 'MIN', 'MAX', 'CUSTOM') NOT NULL DEFAULT 'CUSTOM',
    `value_type` ENUM('NUMBER', 'CURRENCY', 'PERCENTAGE', 'DURATION') NOT NULL DEFAULT 'NUMBER',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Metric_data_source_id_idx`(`data_source_id`),
    INDEX `Metric_created_by_id_idx`(`created_by_id`),
    UNIQUE INDEX `Metric_workspace_id_key_key`(`workspace_id`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DashboardMetric` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dashboard_id` INTEGER NOT NULL,
    `metric_id` INTEGER NOT NULL,
    `title_override` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `layout_x` INTEGER NOT NULL DEFAULT 0,
    `layout_y` INTEGER NOT NULL DEFAULT 0,
    `layout_w` INTEGER NOT NULL DEFAULT 4,
    `layout_h` INTEGER NOT NULL DEFAULT 3,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `DashboardMetric_metric_id_idx`(`metric_id`),
    UNIQUE INDEX `DashboardMetric_dashboard_id_metric_id_key`(`dashboard_id`, `metric_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MetricSnapshot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `metric_id` INTEGER NOT NULL,
    `value` DECIMAL(18, 4) NOT NULL,
    `dimension_json` JSON NULL,
    `captured_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MetricSnapshot_metric_id_captured_at_idx`(`metric_id`, `captured_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Workspace` ADD CONSTRAINT `Workspace_owner_user_id_fkey` FOREIGN KEY (`owner_user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkspaceMember` ADD CONSTRAINT `WorkspaceMember_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkspaceMember` ADD CONSTRAINT `WorkspaceMember_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DataSource` ADD CONSTRAINT `DataSource_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dashboard` ADD CONSTRAINT `Dashboard_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dashboard` ADD CONSTRAINT `Dashboard_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Metric` ADD CONSTRAINT `Metric_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Metric` ADD CONSTRAINT `Metric_data_source_id_fkey` FOREIGN KEY (`data_source_id`) REFERENCES `DataSource`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Metric` ADD CONSTRAINT `Metric_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DashboardMetric` ADD CONSTRAINT `DashboardMetric_dashboard_id_fkey` FOREIGN KEY (`dashboard_id`) REFERENCES `Dashboard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DashboardMetric` ADD CONSTRAINT `DashboardMetric_metric_id_fkey` FOREIGN KEY (`metric_id`) REFERENCES `Metric`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MetricSnapshot` ADD CONSTRAINT `MetricSnapshot_metric_id_fkey` FOREIGN KEY (`metric_id`) REFERENCES `Metric`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
