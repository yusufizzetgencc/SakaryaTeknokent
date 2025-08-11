-- CreateTable
CREATE TABLE `Supplier` (
    `id` VARCHAR(191) NOT NULL,
    `firmaAdi` VARCHAR(191) NOT NULL,
    `yetkiliKisi` VARCHAR(191) NOT NULL,
    `telefon` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `puan` DOUBLE NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
