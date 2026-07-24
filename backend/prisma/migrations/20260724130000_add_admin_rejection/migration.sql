ALTER TABLE `submission`
    MODIFY `status` ENUM(
        'DRAFT',
        'PENDING_ADMIN_REVIEW',
        'PENDING_VALIDATOR_REVIEW',
        'APPROVED',
        'REJECTED_BY_ADMIN',
        'REJECTED_BY_VALIDATOR'
    ) NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN `admin_rejection_reason` TEXT NULL,
    ADD COLUMN `rejected_at` DATETIME(3) NULL;
