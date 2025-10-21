/*
  Warnings:

  - You are about to drop the column `businessId` on the `ProductCategory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `ProductCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."ProductCategory" DROP CONSTRAINT "ProductCategory_businessId_fkey";

-- AlterTable
ALTER TABLE "ProductCategory" DROP COLUMN "businessId",
ADD COLUMN     "icon" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_name_key" ON "ProductCategory"("name");
