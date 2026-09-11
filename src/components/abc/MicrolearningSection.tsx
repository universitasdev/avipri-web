import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { VIDEOS } from "@/lib/abc/content";

export function MicrolearningSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <h2 className="mb-8 text-center font-serif text-3xl font-bold text-brand-navy">
        Centro de píldoras audiovisuales
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {VIDEOS.map((video) => (
          <Card key={video.id} className="flex h-full flex-col overflow-hidden p-0">
            <a
              href={video.href}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block aspect-video overflow-hidden bg-brand-navy"
              aria-label={`Reproducir: ${video.title}`}
            >
              <Image
                src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover opacity-80"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-brand-navy/50 to-transparent" />
              <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-terracotta text-white shadow-lg transition-transform hover:scale-110">
                <FontAwesomeIcon icon={faPlay} className="ml-0.5" />
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
    </section>
  );
}
