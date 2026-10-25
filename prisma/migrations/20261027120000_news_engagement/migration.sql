-- CreateEnum
CREATE TYPE "NewsReactionValue" AS ENUM ('LIKE', 'DISLIKE');

-- AlterTable
ALTER TABLE "NewsArticle" ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dislikeCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "NewsReaction" (
    "articleId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "value" "NewsReactionValue" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsReaction_pkey" PRIMARY KEY ("articleId","visitorId")
);

-- AddForeignKey
ALTER TABLE "NewsReaction" ADD CONSTRAINT "NewsReaction_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "NewsArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
