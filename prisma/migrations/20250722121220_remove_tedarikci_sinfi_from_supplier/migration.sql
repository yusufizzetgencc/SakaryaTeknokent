/*
  Warnings:

  - You are about to drop the column `stageLabel` on the `PurchaseRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `PurchaseRequest` DROP COLUMN `stageLabel`,
    ADD COLUMN `selectedOffer` JSON NULL;
