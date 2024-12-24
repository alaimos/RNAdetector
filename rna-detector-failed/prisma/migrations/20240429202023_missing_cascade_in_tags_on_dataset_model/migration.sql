-- DropForeignKey
ALTER TABLE `data_tags` DROP FOREIGN KEY `data_tags_data_id_fkey`;

-- AddForeignKey
ALTER TABLE `data_tags` ADD CONSTRAINT `data_tags_data_id_fkey` FOREIGN KEY (`data_id`) REFERENCES `data`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
