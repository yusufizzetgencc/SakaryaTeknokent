/*
  Warnings:

  - You are about to drop the column `kategori` on the `PurchaseRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `PurchaseRequest` DROP COLUMN `kategori`,
    ADD COLUMN `kategoriId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `PurchaseCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PurchaseCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PurchaseRequest` ADD CONSTRAINT `PurchaseRequest_kategoriId_fkey` FOREIGN KEY (`kategoriId`) REFERENCES `PurchaseCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
