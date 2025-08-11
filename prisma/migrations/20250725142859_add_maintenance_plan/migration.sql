-- CreateTable
CREATE TABLE `MaintenancePlan` (
    `id` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `plannedDate` DATETIME(3) NOT NULL,
    `completedDate` DATETIME(3) NULL,
    `status` ENUM('PLANNED', 'COMPLETED') NOT NULL DEFAULT 'PLANNED',
    `planningNotes` VARCHAR(191) NULL,
    `completionNotes` VARCHAR(191) NULL,
    `plannedById` VARCHAR(191) NOT NULL,
    `completedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MaintenancePlan` ADD CONSTRAINT `MaintenancePlan_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `MaintenanceDevice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenancePlan` ADD CONSTRAINT `MaintenancePlan_plannedById_fkey` FOREIGN KEY (`plannedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenancePlan` ADD CONSTRAINT `MaintenancePlan_completedById_fkey` FOREIGN KEY (`completedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
