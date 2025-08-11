/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `LeaveRequest` table. All the data in the column will be lost.
  - You are about to drop the column `generatedPdfFileName` on the `LeaveRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `LeaveRequest` DROP COLUMN `fileUrl`,
    DROP COLUMN `generatedPdfFileName`,
    ADD COLUMN `generatedFormUrl` VARCHAR(191) NULL,
    ADD COLUMN `uploadedFileUrl` VARCHAR(191) NULL;
