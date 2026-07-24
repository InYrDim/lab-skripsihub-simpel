-- CreateTable
CREATE TABLE `system_setting` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `system_setting_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert default department setting
INSERT INTO `system_setting` (`id`, `key`, `value`, `created_at`, `updated_at`)
VALUES ('default_department', 'default_department', 'Teknik Informatika dan Komputer', NOW(3), NOW(3));
