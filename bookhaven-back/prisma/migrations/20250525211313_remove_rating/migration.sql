/*
  Warnings:

  - You are about to drop the `BookRating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BookRating" DROP CONSTRAINT "BookRating_bookId_fkey";

-- DropForeignKey
ALTER TABLE "BookRating" DROP CONSTRAINT "BookRating_userId_fkey";

-- DropTable
DROP TABLE "BookRating";
