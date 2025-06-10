/*
  Warnings:

  - Added the required column `city` to the `propertyDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `propertyDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `propertyDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `propertyDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `propertyDetails` ADD COLUMN `area` DOUBLE NULL,
    ADD COLUMN `bathrooms` INTEGER NULL,
    ADD COLUMN `bedrooms` INTEGER NULL,
    ADD COLUMN `city` VARCHAR(191) NOT NULL,
    ADD COLUMN `features` VARCHAR(191) NULL,
    ADD COLUMN `location` VARCHAR(191) NOT NULL,
    ADD COLUMN `state` VARCHAR(191) NOT NULL,
    ADD COLUMN `zipCode` VARCHAR(191) NOT NULL;
