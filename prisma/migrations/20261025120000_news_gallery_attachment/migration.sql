-- AlterTable
ALTER TABLE "NewsArticle" ADD COLUMN     "attachmentBytes" INTEGER,
ADD COLUMN     "attachmentName" TEXT,
ADD COLUMN     "attachmentSrc" TEXT;

-- CreateTable
CREATE TABLE "NewsImage" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "alt" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "NewsImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewsImage_articleId_position_idx" ON "NewsImage"("articleId", "position");

-- AddForeignKey
ALTER TABLE "NewsImage" ADD CONSTRAINT "NewsImage_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "NewsArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- La foto de las noticias existentes pasa a ser la primera de su galería.
INSERT INTO "NewsImage" ("id", "articleId", "src", "alt", "position")
SELECT 'img' || MD5("id" || "imageSrc"), "id", "imageSrc", "imageAlt", 0
FROM "NewsArticle"
WHERE "mediaType" = 'IMAGE' AND "imageSrc" IS NOT NULL AND "imageSrc" <> '';

-- Desde ahora imageSrc es solo la portada de los videos.
UPDATE "NewsArticle" SET "imageSrc" = NULL WHERE "mediaType" = 'IMAGE';
