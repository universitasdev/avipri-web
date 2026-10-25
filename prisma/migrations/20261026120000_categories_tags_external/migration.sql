-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsTag" (
    "articleId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "NewsTag_pkey" PRIMARY KEY ("articleId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");
CREATE INDEX "NewsTag_tagId_idx" ON "NewsTag"("tagId");

-- Las 4 categorías que estaban fijas en el código pasan a ser datos editables.
INSERT INTO "Category" ("id", "slug", "name", "color", "icon") VALUES
  ('cat_institucional', 'analisis-institucional', 'Análisis Institucional', 'navy', 'building'),
  ('cat_doctrina', 'doctrina-legal', 'Doctrina Legal', 'terracotta', 'book'),
  ('cat_vuf', 'retiros-y-vuf', 'Retiros y VUF', 'territorial', 'ruler'),
  ('cat_aula', 'aula-ciudad', 'Aula Ciudad', 'orange', 'graduation');

-- AlterTable: cada noticia apunta a su categoría.
ALTER TABLE "NewsArticle"
ADD COLUMN "categoryId" TEXT,
ADD COLUMN "externalSource" TEXT,
ADD COLUMN "externalUrl" TEXT;

UPDATE "NewsArticle" SET "categoryId" = CASE "category"
  WHEN 'doctrina' THEN 'cat_doctrina'
  WHEN 'vuf' THEN 'cat_vuf'
  WHEN 'aula' THEN 'cat_aula'
  ELSE 'cat_institucional'
END;

-- Si una noticia tenía un "texto de la etiqueta" propio (distinto del de su categoría),
-- no se pierde: pasa a ser una etiqueta de esa noticia.
CREATE TEMP TABLE "_customLabels" AS
SELECT n."id" AS "articleId",
       TRIM(n."categoryLabel") AS "name",
       TRIM(BOTH '-' FROM LEFT(
         TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(
           TRANSLATE(TRIM(n."categoryLabel"), 'áéíóúüñÁÉÍÓÚÜÑàèìòùÀÈÌÒÙ', 'aeiouunAEIOUUNaeiouAEIOU'),
           '[^a-zA-Z0-9]+', '-', 'g'
         ))),
         60
       )) AS "slug"
FROM "NewsArticle" n
JOIN "Category" c ON c."id" = n."categoryId"
WHERE TRIM(n."categoryLabel") <> '' AND TRIM(n."categoryLabel") <> c."name";

INSERT INTO "Tag" ("id", "slug", "name")
SELECT 'tag_' || MD5("slug"), "slug", MIN("name")
FROM "_customLabels"
WHERE "slug" <> ''
GROUP BY "slug";

INSERT INTO "NewsTag" ("articleId", "tagId")
SELECT DISTINCT l."articleId", t."id"
FROM "_customLabels" l
JOIN "Tag" t ON t."slug" = l."slug";

DROP TABLE "_customLabels";

ALTER TABLE "NewsArticle" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "NewsArticle" DROP COLUMN "category", DROP COLUMN "categoryLabel";

-- CreateIndex
CREATE INDEX "NewsArticle_categoryId_idx" ON "NewsArticle"("categoryId");

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NewsTag" ADD CONSTRAINT "NewsTag_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "NewsArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NewsTag" ADD CONSTRAINT "NewsTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
