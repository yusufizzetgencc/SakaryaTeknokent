-- AlterTable
ALTER TABLE `PurchaseRequest` ADD COLUMN `stage` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `stageLabel` VARCHAR(191) NULL;
