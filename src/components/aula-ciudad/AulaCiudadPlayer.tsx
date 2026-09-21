"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { YoutubeVideoItem } from "@/lib/youtube/types";
import { cn } from "@/lib/utils";

function truncateDescription(text: string, max = 900) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trim()}…`;
}

export function AulaCiudadPlayer({ videos }: { videos: YoutubeVideoItem[] }) {
  const [activeId, setActiveId] = useState(videos[0]?.videoId ?? "");
  const active = useMemo(
    () => videos.find((video) => video.videoId === activeId) ?? videos[0],
    [videos, activeId],
  );

  if (!active) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-8">
        <div className="overflow-hidden rounded-xl border border-brand-border bg-black shadow-sm">
          <div className="relative aspect-video w-full">
            <iframe
              key={active.videoId}
              title={active.title}
              src={`https://www.youtube.com/embed/${active.videoId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>

        <h2 className="mt-5 font-serif text-xl font-bold leading-snug text-brand-navy sm:text-2xl">
          {active.title}
        </h2>

        {active.description ? (
          <div className="mt-4 rounded-xl border border-brand-border bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Descripción
            </p>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 sm:text-base">
              {truncateDescription(active.description)}
            </p>
          </div>
        ) : null}
      </div>

      <aside className="lg:col-span-4">
        <div className="mb-4">
          <h3 className="font-serif text-xl font-bold text-brand-navy">Aula Ciudad</h3>
          <p className="mt-0.5 text-sm italic text-slate-500">
            {videos.length} {videos.length === 1 ? "video" : "videos"}
          </p>
        </div>

        <ul className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          {videos.map((video) => {
            const selected = video.videoId === active.videoId;
            return (
              <li key={video.videoId}>
                <button
                  type="button"
                  onClick={() => setActiveId(video.videoId)}
                  aria-current={selected ? "true" : undefined}
                  className={cn(
                    "flex w-full gap-3 rounded-xl border bg-white p-2.5 text-left transition-all",
                    selected
                      ? "border-brand-navy shadow-sm ring-1 ring-brand-navy/20"
                      : "border-brand-border hover:border-brand-navy/40 hover:shadow-sm",
                  )}
                >
                  <span className="relative h-[4.25rem] w-[7.5rem] shrink-0 overflow-hidden rounded-md bg-slate-100">
                    {video.thumbnail ? (
                      <Image
                        src={video.thumbnail}
                        alt=""
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1 py-0.5">
                    <span
                      className={cn(
                        "line-clamp-3 text-sm leading-snug",
                        selected ? "font-semibold text-brand-navy" : "font-medium text-slate-700",
                      )}
                    >
                      {video.title}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
