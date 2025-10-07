-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "averageRating" DOUBLE PRECISION,
ADD COLUMN     "categories" TEXT[],
ADD COLUMN     "description" TEXT;
