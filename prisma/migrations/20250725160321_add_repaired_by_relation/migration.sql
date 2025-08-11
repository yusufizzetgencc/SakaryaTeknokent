-- CreateTable
CREATE TABLE `FaultLog` (
    `id` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `description` TEXT NOT NULL,
    `actionTaken` TEXT NOT NULL,
    `notes` TEXT NULL,
    `downtimeDuration` INTEGER NOT NULL,
    `downtimeUnit` ENUM('HOURS', 'DAYS') NOT NULL,
    `fileUrl` VARCHAR(191) NULL,
    `reportedById` VARCHAR(191) NOT NULL,
    `repairedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FaultLog` ADD CONSTRAINT `FaultLog_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `MaintenanceDevice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FaultLog` ADD CONSTRAINT `FaultLog_reportedById_fkey` FOREIGN KEY (`reportedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FaultLog` ADD CONSTRAINT `FaultLog_repairedById_fkey` FOREIGN KEY (`repairedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
