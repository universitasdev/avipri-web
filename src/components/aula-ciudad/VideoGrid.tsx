import Image from "next/image";
import { Card } from "@/components/ui/Card";
import type { VideoItem } from "@/lib/aula-ciudad/content";

function thumbnailSrc(video: VideoItem) {
  return video.thumbnail ?? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
}

export function VideoGrid({ videos }: { videos: VideoItem[] }) {
  if (videos.length === 0) {
    return (
      <p className="rounded-xl border border-brand-border bg-white px-6 py-12 text-center text-slate-600">
        Pronto publicaremos nuevas videoconferencias de Aula Ciudad.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <Card key={video.id} className="flex h-full flex-col overflow-hidden p-0">
          <a
            href={video.href}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block aspect-video overflow-hidden bg-brand-navy"
            aria-label={`Reproducir: ${video.title}`}
          >
            <Image
              src={thumbnailSrc(video)}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover opacity-80"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-brand-navy/50 to-transparent" />
            <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-terracotta text-white shadow-lg transition-transform hover:scale-110">
              <span
                aria-hidden="true"
                className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[12px] border-y-transparent border-l-white"
              />
            </span>
          </a>
          <div className="flex flex-1 flex-col p-6">
            <span className="mb-2 inline-block w-fit rounded border border-brand-border bg-brand-bone px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
              {video.badge}
            </span>
            <h3 className="font-serif text-xl font-bold leading-snug text-brand-navy">
              {video.title}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
              {video.body}
            </p>
            <a
              href={video.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-brand-navy px-4 py-2.5 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
            >
              Ver videoconferencia
            </a>
          </div>
        </Card>
      ))}
    </div>
  );
}
