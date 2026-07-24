-- CreateTable
CREATE TABLE `topic` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `topic_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- SeedData
INSERT INTO `topic` (`id`, `name`, `is_active`, `created_at`, `updated_at`) VALUES
    ('top_001', 'Software Engineering', true, NOW(3), NOW(3)),
    ('top_002', 'Data Science & Machine Learning', true, NOW(3), NOW(3)),
    ('top_003', 'Cybersecurity', true, NOW(3), NOW(3)),
    ('top_004', 'Internet of Things (IoT)', true, NOW(3), NOW(3)),
    ('top_005', 'Information Systems', true, NOW(3), NOW(3)),
    ('top_006', 'Artificial Intelligence', true, NOW(3), NOW(3)),
    ('top_007', 'Computer Networks', true, NOW(3), NOW(3));
