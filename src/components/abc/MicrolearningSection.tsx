import Link from "next/link";
import { VideoGrid } from "@/components/aula-ciudad/VideoGrid";
import { getPlaylistVideosSafe } from "@/lib/youtube/playlist";
import { VIDEOS, mapYoutubeToVideoItem } from "@/lib/aula-ciudad/content";

export async function MicrolearningSection() {
  const { videos } = await getPlaylistVideosSafe();
  const preview =
    videos.length > 0
      ? videos.slice(0, 3).map(mapYoutubeToVideoItem)
      : VIDEOS.slice(0, 3);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h2 className="font-serif text-3xl font-bold text-brand-navy">
          Centro de píldoras audiovisuales
        </h2>
        <p className="mt-2 text-slate-600">
          Una selección de Aula Ciudad. El catálogo completo está en la página
          del mismo nombre.
        </p>
      </div>
      <VideoGrid videos={preview} />
      <div className="mt-8 text-center">
        <Link
          href="/aula-ciudad"
          className="inline-flex items-center justify-center rounded-lg bg-brand-terracotta px-6 py-3 font-medium text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-orange-800"
        >
          Ver todas las videoconferencias
        </Link>
      </div>
    </section>
  );
}
