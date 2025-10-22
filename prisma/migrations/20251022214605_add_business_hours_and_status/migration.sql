-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('ABIERTO', 'CERRADO_TEMPORAL', 'CERRADO_PERMANENTE');

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "acceptOrdersOutsideHours" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "closedReason" TEXT,
ADD COLUMN     "preparationTime" INTEGER DEFAULT 30,
ADD COLUMN     "schedule" JSONB,
ADD COLUMN     "specialClosedDays" JSONB,
ADD COLUMN     "status" "BusinessStatus" NOT NULL DEFAULT 'ABIERTO';
