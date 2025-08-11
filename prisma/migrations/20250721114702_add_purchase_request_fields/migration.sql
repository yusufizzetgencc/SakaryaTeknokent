/*
  Warnings:

  - Added the required column `kategori` to the `PurchaseRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PurchaseRequest` ADD COLUMN `kategori` VARCHAR(191) NOT NULL,
    ADD COLUMN `sartnameGerekli` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sozlesmeGerekli` BOOLEAN NOT NULL DEFAULT false;
