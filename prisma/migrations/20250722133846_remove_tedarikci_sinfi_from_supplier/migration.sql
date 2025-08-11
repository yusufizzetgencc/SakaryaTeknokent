-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `approved` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `rejectionReason` VARCHAR(191) NULL;
