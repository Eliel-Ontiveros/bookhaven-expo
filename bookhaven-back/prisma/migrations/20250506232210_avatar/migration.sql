/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "avatarUrl",
ADD COLUMN     "avatarId" TEXT;
