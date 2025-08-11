-- AlterTable
ALTER TABLE `PurchaseRequest` ADD COLUMN `approved` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `offers` JSON NULL,
    ADD COLUMN `rejected` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `rejectionReason` VARCHAR(191) NULL;
