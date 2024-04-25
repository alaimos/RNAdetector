-- CreateTable
CREATE TABLE `analyses` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `parameters` JSON NULL,
    `output` JSON NULL,
    `created_by` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `id` VARCHAR(191) NOT NULL,
    `queue_id` VARCHAR(191) NULL,
    `analysis_id` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'waiting', 'running', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    `reasons` VARCHAR(191) NULL,
    `created_by` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `analyses` ADD CONSTRAINT `analyses_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_analysis_id_fkey` FOREIGN KEY (`analysis_id`) REFERENCES `analyses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
