-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookList" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookListEntry" (
    "id" SERIAL NOT NULL,
    "bookId" TEXT NOT NULL,
    "bookListId" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookListEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BookList" ADD CONSTRAINT "BookList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookListEntry" ADD CONSTRAINT "BookListEntry_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookListEntry" ADD CONSTRAINT "BookListEntry_bookListId_fkey" FOREIGN KEY ("bookListId") REFERENCES "BookList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
