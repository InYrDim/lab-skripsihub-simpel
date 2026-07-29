-- Add the user lifecycle fields expected by the current Prisma schema.
ALTER TABLE `user`
    ADD COLUMN `status` ENUM('MENUNGGU_APPROVE', 'AKTIF', 'NONAKTIF', 'DITOLAK') NOT NULL DEFAULT 'AKTIF',
    ADD COLUMN `photo_url` VARCHAR(191) NULL;

-- Preserve inactive users from the legacy boolean field.
UPDATE `user`
SET `status` = CASE
    WHEN `is_active` = true THEN 'AKTIF'
    ELSE 'NONAKTIF'
END;
