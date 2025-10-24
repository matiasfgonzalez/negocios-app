-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "maxShippingDistance" DOUBLE PRECISION,
ADD COLUMN     "shippingRanges" JSONB;
