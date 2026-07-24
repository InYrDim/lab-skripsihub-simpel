-- Add the replacement enum value before migrating existing rows.
ALTER TABLE `submission`
    MODIFY `status` ENUM(
        'DRAFT',
        'PENDING_ADMIN_REVIEW',
        'PENDING_VALIDATOR_REVIEW',
        'APPROVED',
        'REJECTED',
        'REJECTED_BY_VALIDATOR'
    ) NOT NULL DEFAULT 'DRAFT';

UPDATE `submission`
SET `status` = 'REJECTED_BY_VALIDATOR'
WHERE `status` = 'REJECTED';

-- Remove the legacy status after all rows have been migrated.
ALTER TABLE `submission`
    MODIFY `status` ENUM(
        'DRAFT',
        'PENDING_ADMIN_REVIEW',
        'PENDING_VALIDATOR_REVIEW',
        'APPROVED',
        'REJECTED_BY_VALIDATOR'
    ) NOT NULL DEFAULT 'DRAFT';
