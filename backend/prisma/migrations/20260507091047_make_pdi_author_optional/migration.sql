-- DropForeignKey
ALTER TABLE "PdiEntry" DROP CONSTRAINT "PdiEntry_authorId_fkey";

-- DropForeignKey
ALTER TABLE "PdiEntryRevision" DROP CONSTRAINT "PdiEntryRevision_editorId_fkey";

-- AlterTable
ALTER TABLE "PdiEntry" ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PdiEntryRevision" ALTER COLUMN "editorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PdiEntry" ADD CONSTRAINT "PdiEntry_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdiEntryRevision" ADD CONSTRAINT "PdiEntryRevision_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
