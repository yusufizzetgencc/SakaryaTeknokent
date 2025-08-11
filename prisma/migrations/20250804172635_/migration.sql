-- CreateTable
CREATE TABLE `ProjectContract` (
    `id` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `academicianName` VARCHAR(191) NOT NULL,
    `projectNumber` VARCHAR(191) NOT NULL,
    `projectStartDate` DATETIME(3) NOT NULL,
    `invoiceStartDate` DATETIME(3) NOT NULL,
    `invoiceType` ENUM('ONE_TIME', 'MONTHLY') NOT NULL,
    `invoiceDurationMonths` INTEGER NULL,
    `invoiceAmount` DOUBLE NULL,
    `companyContractUrl` VARCHAR(191) NOT NULL,
    `academicianContractUrl` VARCHAR(191) NOT NULL,
    `uploadedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProjectContract_projectNumber_key`(`projectNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectInvoice` (
    `id` VARCHAR(191) NOT NULL,
    `projectContractId` VARCHAR(191) NOT NULL,
    `invoiceDate` DATETIME(3) NOT NULL,
    `amount` DOUBLE NULL,
    `status` ENUM('PENDING', 'ISSUED', 'RECEIVED', 'PAID_OUT', 'PAID', 'OVERDUE', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `fileUrl` VARCHAR(191) NULL,
    `paymentDate` DATETIME(3) NULL,
    `issuedDate` DATETIME(3) NULL,
    `paymentReceivedDate` DATETIME(3) NULL,
    `academicianPaidDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProjectContract` ADD CONSTRAINT `ProjectContract_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectInvoice` ADD CONSTRAINT `ProjectInvoice_projectContractId_fkey` FOREIGN KEY (`projectContractId`) REFERENCES `ProjectContract`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
