-- DropForeignKey
ALTER TABLE `_RolePermissions` DROP FOREIGN KEY `_RolePermissions_A_fkey`;

-- DropForeignKey
ALTER TABLE `_RolePermissions` DROP FOREIGN KEY `_RolePermissions_B_fkey`;

-- DropForeignKey
ALTER TABLE `_UserPermissions` DROP FOREIGN KEY `_UserPermissions_A_fkey`;

-- DropForeignKey
ALTER TABLE `_UserPermissions` DROP FOREIGN KEY `_UserPermissions_B_fkey`;

-- DropIndex
DROP INDEX `_RolePermissions_B_index` ON `_RolePermissions`;

-- DropIndex
DROP INDEX `_UserPermissions_B_index` ON `_UserPermissions`;

-- AlterTable
ALTER TABLE `_RolePermissions` ADD PRIMARY KEY (`A`, `B`);

-- DropIndex
DROP INDEX `_RolePermissions_AB_unique` ON `_RolePermissions`;

-- AlterTable
ALTER TABLE `_UserPermissions` ADD PRIMARY KEY (`A`, `B`);

-- DropIndex
DROP INDEX `_UserPermissions_AB_unique` ON `_UserPermissions`;

-- AddForeignKey
ALTER TABLE `_RolePermissions` ADD CONSTRAINT `_RolePermissions_A_fkey` FOREIGN KEY (`A`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RolePermissions` ADD CONSTRAINT `_RolePermissions_B_fkey` FOREIGN KEY (`B`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserPermissions` ADD CONSTRAINT `_UserPermissions_A_fkey` FOREIGN KEY (`A`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserPermissions` ADD CONSTRAINT `_UserPermissions_B_fkey` FOREIGN KEY (`B`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
