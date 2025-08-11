/*
  Warnings:

  - You are about to drop the column `sartnameGerekli` on the `PurchaseRequest` table. All the data in the column will be lost.
  - You are about to drop the column `sozlesmeGerekli` on the `PurchaseRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `PurchaseRequest` DROP COLUMN `sartnameGerekli`,
    DROP COLUMN `sozlesmeGerekli`;
