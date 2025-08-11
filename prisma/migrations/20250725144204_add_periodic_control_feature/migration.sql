-- CreateTable
CREATE TABLE `PeriodicControl` (
    `id` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `frequency` ENUM('MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'ANNUALLY') NOT NULL,
    `nextControlDate` DATETIME(3) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PeriodicControl_deviceId_key`(`deviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PeriodicControlLog` (
    `id` VARCHAR(191) NOT NULL,
    `controlPlanId` VARCHAR(191) NOT NULL,
    `controlDate` DATETIME(3) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `performedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PeriodicControl` ADD CONSTRAINT `PeriodicControl_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `MaintenanceDevice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PeriodicControl` ADD CONSTRAINT `PeriodicControl_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PeriodicControlLog` ADD CONSTRAINT `PeriodicControlLog_controlPlanId_fkey` FOREIGN KEY (`controlPlanId`) REFERENCES `PeriodicControl`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PeriodicControlLog` ADD CONSTRAINT `PeriodicControlLog_performedById_fkey` FOREIGN KEY (`performedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
