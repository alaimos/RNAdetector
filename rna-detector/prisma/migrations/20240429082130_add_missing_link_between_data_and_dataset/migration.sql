/*
  Warnings:

  - Added the required column `dataset_id` to the `data` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `data` ADD COLUMN `dataset_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `data` ADD CONSTRAINT `data_dataset_id_fkey` FOREIGN KEY (`dataset_id`) REFERENCES `datasets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
