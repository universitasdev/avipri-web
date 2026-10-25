import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { faArrowRight, faPlay, faStar, faVideo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CATEGORY_STYLES } from "@/components/observatorio/categoryStyles";
import type { NewsArticle } from "@/lib/observatorio/content";
import { acomodarMosaico, type Celda, type FormatoMosaico } from "@/lib/observatorio/mosaic";

/*
 * Listado del Observatorio con el mosaico de PDUL YA, en la identidad de PEDUL Online.
 * Cada noticia es una pieza que lleva a /observatorio/<slug>:
 *   DESTACADA 2×2  la noticia destacada (foto, video o texto) en grande
 *   VIDEO     2×2  portada a sangre con botón de reproducir
 *   IMAGEN    1×2  foto vertical a sangre; el subtítulo aparece al pasar el cursor
 *   TEXTO     2×1  franja con el color de la categoría, para noticias sin foto ni video
 */

/** Color de las piezas sin foto. Aula Ciudad va en naranja con texto oscuro. */
const CATEGORY_FILL: Record<NewsArticle["category"], { bg: string; icon: string; dark?: boolean }> =
  {
    institucional: { bg: "bg-brand-navy", icon: "text-white/10" },
    doctrina: { bg: "bg-brand-terracotta", icon: "text-white/15" },
    vuf: { bg: "bg-brand-territorial", icon: "text-white/15" },
    aula: { bg: "bg-brand-orange", icon: "text-brand-navy/15", dark: true },
  };

/** Degradado navy (#1a2b4b) para leer el texto sobre fotos. */
const SHADE_IMAGE =
  "bg-[linear-gradient(0deg,rgb(26_43_75/0.95)_0%,rgb(26_43_75/0.55)_45%,rgb(26_43_75/0)_75%)]";
const SHADE_VIDEO =
  "bg-[linear-gradient(0deg,rgb(26_43_75/0.95)_0%,rgb(26_43_75/0.35)_45%,rgb(26_43_75/0.15)_100%)]";

const piece =
  "group relative overflow-hidden rounded-2xl shadow-md transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl focus-within:-translate-y-1 focus-within:shadow-xl";

function formatOf(article: NewsArticle): FormatoMosaico {
  if (article.featured) return "DESTACADA";
  if (article.video) return "VIDEO";
  if (article.image) return "IMAGEN";
  return "TEXTO";
}

/** La posición va en variables CSS para cambiarla según el ancho de pantalla. */
const placement = (sm: Celda, lg: Celda) =>
  ({
    "--sm-col": `${sm.col} / span ${sm.w}`,
    "--sm-row": `${sm.row} / span ${sm.h}`,
    "--lg-col": `${lg.col} / span ${lg.w}`,
    "--lg-row": `${lg.row} / span ${lg.h}`,
  }) as CSSProperties;

function Meta({ article, light = false }: { article: NewsArticle; light?: boolean }) {
  return (
    <p
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${light ? "text-white/85" : "text-brand-navy/80"}`}
    >
      {article.featured ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange px-2.5 py-0.5 font-semibold text-brand-navy">
          <FontAwesomeIcon icon={faStar} />
          Destacada
        </span>
      ) : null}
      <span
        className={`rounded-full px-2.5 py-0.5 font-semibold ${
          light ? "bg-white/15 text-white backdrop-blur-sm" : "bg-brand-navy/10 text-brand-navy"
        }`}
      >
        {article.categoryLabel}
      </span>
      <span aria-hidden="true">·</span>
      <time dateTime={article.isoDate}>{article.dateShort}</time>
    </p>
  );
}

/** El enlace cubre toda la pieza. */
function TitleLink({ article, className }: { article: NewsArticle; className: string }) {
  return (
    <h2 className={className}>
      <Link href={`/observatorio/${article.slug}`} className="after:absolute after:inset-0">
        {article.title}
      </Link>
    </h2>
  );
}

function ImagePiece({
  article,
  priority,
  big,
}: {
  article: NewsArticle;
  priority: boolean;
  big: boolean;
}) {
  const image = article.image!;
  return (
    <article className={`${piece} h-[26rem] bg-brand-navy sm:h-full`}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={big ? "(min-width: 1024px) 620px, 100vw" : "(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"}
        priority={priority}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
      />
      <div aria-hidden="true" className={`absolute inset-0 ${SHADE_IMAGE}`} />
      <div className={`absolute inset-x-0 bottom-0 ${big ? "p-6 sm:p-8" : "p-5"}`}>
        <Meta article={article} light />
        <TitleLink
          article={article}
          className={`mt-2 font-serif font-bold leading-tight text-white ${
            big ? "line-clamp-4 text-2xl sm:text-3xl" : "line-clamp-5 text-xl"
          }`}
        />
        {/* El subtítulo se despliega al pasar el cursor o con el foco; en pantallas táctiles queda visible. */}
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/85 transition-[max-height,opacity] duration-500 ease-out [@media(hover:hover)]:max-h-0 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:max-h-24 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:max-h-24 [@media(hover:hover)]:group-hover:opacity-100">
          {article.subtitle}
        </p>
      </div>
    </article>
  );
}

function VideoPiece({ article, priority }: { article: NewsArticle; priority: boolean }) {
  const video = article.video!;
  return (
    <article className={`${piece} h-[24rem] bg-brand-navy sm:h-full`}>
      {video.poster ? (
        <Image
          src={video.poster}
          alt=""
          fill
          sizes="(min-width: 1024px) 620px, 100vw"
          priority={priority}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      ) : video.kind === "file" ? (
        // Sin portada: se muestra el primer cuadro del video.
        <video
          src={`${video.src}#t=0.1`}
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      <div aria-hidden="true" className={`absolute inset-0 ${SHADE_VIDEO}`} />
      <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-brand-navy/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
        <FontAwesomeIcon icon={faVideo} />
        Video
      </span>
      {/* Botón decorativo: toda la pieza lleva a la noticia, donde se reproduce. */}
      <span
        aria-hidden="true"
        className="absolute top-[34%] left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-terracotta text-xl text-white shadow-xl ring-8 ring-white/20 transition-[transform,box-shadow] duration-300 ease-out group-hover:scale-110 group-hover:ring-white/30 sm:top-[40%] sm:size-18 sm:text-2xl"
      >
        <FontAwesomeIcon icon={faPlay} className="translate-x-0.5" />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <Meta article={article} light />
        <TitleLink
          article={article}
          className="mt-3 line-clamp-3 max-w-xl font-serif text-2xl font-bold leading-tight text-white sm:text-3xl"
        />
        <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/85 sm:text-base">
          {article.subtitle}
        </p>
      </div>
    </article>
  );
}

function TextPiece({ article }: { article: NewsArticle }) {
  const fill = CATEGORY_FILL[article.category];
  const icon = CATEGORY_STYLES[article.category].icon;
  return (
    <article
      className={`${piece} @container flex h-full min-h-56 flex-col justify-between p-6 sm:min-h-0 sm:p-6 ${fill.bg}`}
    >
      <FontAwesomeIcon
        icon={icon}
        aria-hidden="true"
        className={`pointer-events-none absolute -right-4 -bottom-6 !h-40 !w-40 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-rotate-6 @[36rem]:!h-64 @[36rem]:!w-64 ${fill.icon}`}
      />
      <Meta article={article} light={!fill.dark} />
      <div className="relative mt-4">
        <TitleLink
          article={article}
          className={`line-clamp-3 max-w-2xl font-serif text-xl font-bold leading-tight @[28rem]:line-clamp-2 @[28rem]:text-2xl @[40rem]:text-3xl ${
            fill.dark ? "text-brand-navy" : "text-white"
          }`}
        />
        <p
          className={`mt-2 line-clamp-2 max-w-xl text-sm leading-relaxed sm:line-clamp-1 ${
            fill.dark ? "text-brand-navy/85" : "text-white/85"
          }`}
        >
          {article.subtitle}
        </p>
      </div>
      <FontAwesomeIcon
        icon={faArrowRight}
        aria-hidden="true"
        className={`absolute top-6 right-6 -rotate-45 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
          fill.dark ? "text-brand-navy" : "text-white"
        }`}
      />
    </article>
  );
}

export function NewsMosaic({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) {
    return (
      <p className="rounded-xl border border-brand-border bg-white px-6 py-12 text-center text-slate-600">
        Pronto publicaremos más análisis en el Observatorio.
      </p>
    );
  }

  const formats = articles.map(formatOf);
  const tablet = acomodarMosaico(formats, 2);
  const desktop = acomodarMosaico(formats, 4);

  return (
    <ul className="grid gap-4 sm:auto-rows-[12rem] sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
      {articles.map((article, i) => (
        <li
          key={article.slug}
          style={placement(tablet[i]!, desktop[i]!)}
          className="sm:[grid-column:var(--sm-col)] sm:[grid-row:var(--sm-row)] lg:[grid-column:var(--lg-col)] lg:[grid-row:var(--lg-row)]"
        >
          {article.video ? (
            <VideoPiece article={article} priority={i < 2} />
          ) : article.image ? (
            <ImagePiece article={article} priority={i < 2} big={formats[i] === "DESTACADA"} />
          ) : (
            <TextPiece article={article} />
          )}
        </li>
      ))}
    </ul>
  );
}
