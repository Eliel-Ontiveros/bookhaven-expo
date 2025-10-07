/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `avatarId` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the `Book` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookList` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookListEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Genre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserGenre` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_genreId_fkey";

-- DropForeignKey
ALTER TABLE "BookList" DROP CONSTRAINT "BookList_userId_fkey";

-- DropForeignKey
ALTER TABLE "BookListEntry" DROP CONSTRAINT "BookListEntry_bookId_fkey";

-- DropForeignKey
ALTER TABLE "BookListEntry" DROP CONSTRAINT "BookListEntry_bookListId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_bookId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserGenre" DROP CONSTRAINT "UserGenre_genreId_fkey";

-- DropForeignKey
ALTER TABLE "UserGenre" DROP CONSTRAINT "UserGenre_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarUrl";

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "avatarId";

-- DropTable
DROP TABLE "Book";

-- DropTable
DROP TABLE "BookList";

-- DropTable
DROP TABLE "BookListEntry";

-- DropTable
DROP TABLE "Genre";

-- DropTable
DROP TABLE "Review";

-- DropTable
DROP TABLE "UserGenre";

-- DropEnum
DROP TYPE "ReadingStatus";
