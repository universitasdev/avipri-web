-- AlterTable
ALTER TABLE "NewsArticle" ADD COLUMN "slug" TEXT;

-- Slug a partir del título: sin acentos, en minúsculas y con guiones, máximo 80 caracteres.
UPDATE "NewsArticle"
SET "slug" = TRIM(BOTH '-' FROM LEFT(
  TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(
    TRANSLATE("title", 'áéíóúüñÁÉÍÓÚÜÑàèìòùÀÈÌÒÙ', 'aeiouunAEIOUUNaeiouAEIOU'),
    '[^a-zA-Z0-9]+', '-', 'g'
  ))),
  80
));

-- Títulos vacíos o repetidos: se usa el id o se le agrega un sufijo para que sea único.
UPDATE "NewsArticle" SET "slug" = "id" WHERE "slug" IS NULL OR "slug" = '';

UPDATE "NewsArticle" AS n
SET "slug" = LEFT(n."slug", 73) || '-' || RIGHT(n."id", 6)
FROM (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "createdAt", "id") AS rn
  FROM "NewsArticle"
) AS dup
WHERE n."id" = dup."id" AND dup.rn > 1;

ALTER TABLE "NewsArticle" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_slug_key" ON "NewsArticle"("slug");
