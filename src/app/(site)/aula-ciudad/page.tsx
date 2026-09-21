import type { Metadata } from "next";
import { AulaCiudadHero } from "@/components/aula-ciudad/AulaCiudadHero";
import { AulaCiudadPlayer } from "@/components/aula-ciudad/AulaCiudadPlayer";
import { getPlaylistVideosSafe } from "@/lib/youtube/playlist";
import { VIDEOS } from "@/lib/aula-ciudad/content";
import type { YoutubeVideoItem } from "@/lib/youtube/types";

export const metadata: Metadata = {
  title: "Aula Ciudad",
  description:
    "Iniciativa académica de Universitas Fundación sobre derecho urbanístico, planificación territorial y gobernanza local.",
};

function fallbackVideos(): YoutubeVideoItem[] {
  return VIDEOS.map((video, index) => ({
    videoId: video.id,
    title: video.title,
    description: video.body,
    thumbnail: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
    url: video.href,
    position: index,
  }));
}

export default async function AulaCiudadPage() {
  const { videos, error, configured } = await getPlaylistVideosSafe();
  const catalog = videos.length > 0 ? videos : fallbackVideos();

  return (
    <div className="bg-slate-50/80">
      <AulaCiudadHero />
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {!configured ? (
          <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Aula Ciudad se alimenta de la playlist de YouTube. Configura{" "}
            <code className="rounded bg-white px-1">YOUTUBE_API_KEY</code> y{" "}
            <code className="rounded bg-white px-1">PLAYLIST_ID</code> en el{" "}
            <code className="rounded bg-white px-1">.env</code> y reinicia el servidor.
            Mientras tanto se muestra un catálogo de respaldo.
          </p>
        ) : null}
        {configured && error ? (
          <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            No se pudo sincronizar con YouTube ({error}). Se muestra el catálogo de respaldo.
          </p>
        ) : null}
        <AulaCiudadPlayer videos={catalog} />
      </section>
    </div>
  );
}
