-- AlterTable
ALTER TABLE `user`
    ADD COLUMN `department` VARCHAR(191) NULL DEFAULT 'Teknik Informatika dan Komputer',
    ADD COLUMN `prodi` ENUM('PTIK', 'TEKOM') NOT NULL DEFAULT 'PTIK';

-- AlterTable
ALTER TABLE `submission`
    ADD COLUMN `pembimbing_1_id` VARCHAR(191) NULL,
    ADD COLUMN `pembimbing_2_id` VARCHAR(191) NULL,
    ADD COLUMN `penguji_1_id` VARCHAR(191) NULL,
    ADD COLUMN `penguji_2_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `submission_title`
    ADD COLUMN `topic` VARCHAR(255) NULL;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `submission_pembimbing_1_id_fkey` FOREIGN KEY (`pembimbing_1_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `submission_pembimbing_2_id_fkey` FOREIGN KEY (`pembimbing_2_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `submission_penguji_1_id_fkey` FOREIGN KEY (`penguji_1_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `submission_penguji_2_id_fkey` FOREIGN KEY (`penguji_2_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
