-- AlterTable
ALTER TABLE `LeaveRequest` ADD COLUMN `contactInfo` VARCHAR(191) NULL,
    ADD COLUMN `explanation` VARCHAR(191) NULL,
    ADD COLUMN `fileUrl` VARCHAR(191) NULL,
    ADD COLUMN `unit` VARCHAR(191) NULL;
