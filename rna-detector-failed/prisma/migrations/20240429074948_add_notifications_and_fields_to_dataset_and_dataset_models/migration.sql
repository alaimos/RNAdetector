/*
  Warnings:

  - You are about to drop the column `sample_name` on the `data` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `tags` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `data` DROP COLUMN `sample_name`,
    ADD COLUMN `public` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `queue_id` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('pending', 'waiting', 'running', 'completed', 'failed') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `datasets` ADD COLUMN `public` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('INFO', 'WARNING', 'ERROR') NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `created_by` VARCHAR(191) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `tags_name_key` ON `tags`(`name`);

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
