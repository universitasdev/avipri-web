"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CATEGORY_STYLES } from "@/components/observatorio/categoryStyles";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { NewsArticle, NewsPoint } from "@/lib/observatorio/content";

function PointsBox({
  label,
  points,
}: {
  label?: string;
  points: NewsPoint[];
}) {
  return (
    <div className="space-y-2.5 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
      {label ? (
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
      ) : null}
      {points.map((point) => (
        <p key={point.title}>
          <strong className="text-slate-700">• {point.title}:</strong> {point.body}
        </p>
      ))}
    </div>
  );
}

function NewsCardPreview({
  article,
  onReadMore,
}: {
  article: NewsArticle;
  onReadMore: () => void;
}) {
  const category = CATEGORY_STYLES[article.category];

  return (
    <article className="flex h-full min-h-[22rem] flex-col rounded-xl border border-brand-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${category.chip}`}
        >
          <FontAwesomeIcon icon={category.icon} />
          {article.categoryLabel}
        </span>
        <span className="shrink-0 text-xs text-slate-400">{article.dateShort}</span>
      </div>
      <h3 className="mb-2 line-clamp-3 font-serif text-xl font-bold leading-snug text-brand-navy">
        {article.title}
      </h3>
      <p className="mb-5 line-clamp-3 text-sm font-medium leading-relaxed text-slate-600">
        {article.subtitle}
      </p>
      <button
        type="button"
        onClick={onReadMore}
        className="mt-auto inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-terracotta transition-colors hover:text-orange-800"
      >
        Leer más
        <span aria-hidden="true">➔</span>
      </button>
    </article>
  );
}

function NewsArticleDialog({
  article,
  open,
  onOpenChange,
}: {
  article: NewsArticle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!article) return null;

  const category = CATEGORY_STYLES[article.category];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${category.chip}`}
            >
              <FontAwesomeIcon icon={category.icon} />
              {article.categoryLabel}
            </span>
            <span className="text-xs text-slate-400">{article.date}</span>
          </div>
          <DialogTitle>{article.title}</DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-600 sm:text-base">
            {article.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {article.lead ? (
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{article.lead}</p>
          ) : null}

          {article.points.length > 0 ? (
            <PointsBox label={article.pointsLabel} points={article.points} />
          ) : null}

          {article.eventDetails ? (
            <PointsBox label={article.eventDetailsLabel} points={article.eventDetails} />
          ) : null}

          {article.cta && article.href ? (
            <a
              href={article.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-terracotta hover:text-orange-800"
            >
              {article.cta} ➔
            </a>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function NewsGrid({ articles }: { articles: NewsArticle[] }) {
  const [active, setActive] = useState<NewsArticle | null>(null);
  const [open, setOpen] = useState(false);

  if (articles.length === 0) {
    return (
      <p className="rounded-xl border border-brand-border bg-white px-6 py-12 text-center text-slate-600">
        Pronto publicaremos más análisis en el Observatorio.
      </p>
    );
  }

  return (
    <div className="relative">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full px-10 sm:px-12"
      >
        <CarouselContent className="-ml-4">
          {articles.map((article) => (
            <CarouselItem
              key={article.id}
              className="pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3"
            >
              <NewsCardPreview
                article={article}
                onReadMore={() => {
                  setActive(article);
                  setOpen(true);
                }}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 z-10 border-brand-border bg-white text-brand-navy shadow-md hover:bg-slate-50 disabled:opacity-30" />
        <CarouselNext className="right-0 z-10 border-brand-border bg-white text-brand-navy shadow-md hover:bg-slate-50 disabled:opacity-30" />
      </Carousel>

      <NewsArticleDialog
        article={active}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setActive(null);
        }}
      />
    </div>
  );
}
