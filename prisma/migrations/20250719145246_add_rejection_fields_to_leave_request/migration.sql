/*
  Warnings:

  - You are about to drop the column `contactInfo` on the `LeaveRequest` table. All the data in the column will be lost.
  - You are about to drop the column `explanation` on the `LeaveRequest` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `LeaveRequest` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `LeaveRequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `LeaveRequest` DROP FOREIGN KEY `LeaveRequest_userId_fkey`;

-- DropIndex
DROP INDEX `LeaveRequest_userId_fkey` ON `LeaveRequest`;

-- AlterTable
ALTER TABLE `LeaveRequest` DROP COLUMN `contactInfo`,
    DROP COLUMN `explanation`,
    DROP COLUMN `fileUrl`,
    DROP COLUMN `unit`,
    ADD COLUMN `rejected` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `rejectionReason` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
