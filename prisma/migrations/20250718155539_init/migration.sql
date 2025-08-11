/*
  Warnings:

  - You are about to drop the column `userTypeId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `UserType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_userTypeId_fkey`;

-- DropIndex
DROP INDEX `User_userTypeId_fkey` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `userTypeId`;

-- DropTable
DROP TABLE `UserType`;
