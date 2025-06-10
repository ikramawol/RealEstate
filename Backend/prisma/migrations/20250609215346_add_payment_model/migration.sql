/*
  Warnings:

  - Added the required column `images` to the `propertyDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `propertyDetails` ADD COLUMN `images` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `propertyId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `txRef` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_txRef_key`(`txRef`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `propertyDetails`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
