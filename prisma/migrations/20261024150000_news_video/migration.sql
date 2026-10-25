-- CreateEnum
CREATE TYPE "NewsMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "NewsArticle" ADD COLUMN     "mediaType" "NewsMediaType" NOT NULL DEFAULT 'IMAGE',
ADD COLUMN     "videoFileSrc" TEXT,
ADD COLUMN     "videoYoutubeId" TEXT;

