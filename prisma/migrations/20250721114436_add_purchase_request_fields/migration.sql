/*
  Warnings:

  - Added the required column `birim` to the `PurchaseRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ihtiyacSebebi` to the `PurchaseRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `malzeme` to the `PurchaseRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `miktar` to the `PurchaseRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PurchaseRequest` ADD COLUMN `birim` VARCHAR(191) NOT NULL,
    ADD COLUMN `ihtiyacSebebi` VARCHAR(191) NOT NULL,
    ADD COLUMN `malzeme` VARCHAR(191) NOT NULL,
    ADD COLUMN `malzemeOzellik` VARCHAR(191) NULL,
    ADD COLUMN `miktar` INTEGER NOT NULL,
    ADD COLUMN `tarih` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
