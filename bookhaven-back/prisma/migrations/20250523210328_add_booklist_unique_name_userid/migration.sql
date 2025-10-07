/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `BookList` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BookList_name_userId_key" ON "BookList"("name", "userId");
