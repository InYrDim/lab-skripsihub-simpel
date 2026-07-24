-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `role` ENUM('STUDENT', 'ADMIN', 'VALIDATOR') NOT NULL,
    `university_id` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    UNIQUE INDEX `user_university_id_key`(`university_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submission` (
    `id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'PENDING_ADMIN_REVIEW', 'PENDING_VALIDATOR_REVIEW', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    `approved_title_id` VARCHAR(191) NULL,
    `submitted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submission_title` (
    `id` VARCHAR(191) NOT NULL,
    `submission_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `description` TEXT NULL,
    `sequence_number` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assignment` (
    `id` VARCHAR(191) NOT NULL,
    `submission_id` VARCHAR(191) NOT NULL,
    `validator_id` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `validator_feedback` (
    `id` VARCHAR(191) NOT NULL,
    `assignment_id` VARCHAR(191) NOT NULL,
    `submission_id` VARCHAR(191) NOT NULL,
    `decision` ENUM('APPROVED', 'REJECTED') NOT NULL,
    `feedback_text` TEXT NULL,
    `approved_title_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `validator_feedback_assignment_id_key`(`assignment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_letter` (
    `id` VARCHAR(191) NOT NULL,
    `submission_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `approved_title` VARCHAR(500) NOT NULL,
    `pdf_url` VARCHAR(1024) NOT NULL,
    `pdf_s3_key` VARCHAR(1024) NOT NULL,
    `generated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `approval_letter_submission_id_key`(`submission_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` ENUM('SUBMISSION_RECEIVED', 'ASSIGNED_TO_VALIDATOR', 'FINAL_DECISION', 'NEW_ASSIGNMENT') NOT NULL,
    `message` TEXT NOT NULL,
    `related_submission_id` VARCHAR(191) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `submission_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission_title` ADD CONSTRAINT `submission_title_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `submission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignment` ADD CONSTRAINT `assignment_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `submission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignment` ADD CONSTRAINT `assignment_validator_id_fkey` FOREIGN KEY (`validator_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `validator_feedback` ADD CONSTRAINT `validator_feedback_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `assignment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `validator_feedback` ADD CONSTRAINT `validator_feedback_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `submission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_letter` ADD CONSTRAINT `approval_letter_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `submission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_related_submission_id_fkey` FOREIGN KEY (`related_submission_id`) REFERENCES `submission`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
