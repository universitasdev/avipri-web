export type YoutubeVideoItem = {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  position: number;
};

/** Compatibilidad con la rejilla usada en ABC (teaser). */
export type VideoItem = {
  id: string;
  badge: string;
  title: string;
  body: string;
  href: string;
  thumbnail?: string;
  publishedAt?: string;
};

export function mapYoutubeToVideoItem(video: YoutubeVideoItem): VideoItem {
  return {
    id: video.videoId,
    badge: "Aula Ciudad",
    title: video.title,
    body: video.description,
    href: video.url,
    thumbnail: video.thumbnail,
  };
}

/**
 * Fallback local si aún no hay YOUTUBE_API_KEY / PLAYLIST_ID.
 * En producción la fuente es la playlist de YouTube.
 */
export const VIDEOS: VideoItem[] = [
  {
    id: "i39jb9-DDPA",
    badge: "Aula Ciudad",
    title: "Deuda legislativa urbanística en Venezuela",
    body: "El Dr. Carlos García Soto analiza la obsolescencia de las leyes urbanísticas, la inseguridad jurídica y la urgencia de fortalecer la autonomía municipal.",
    href: "https://www.youtube.com/watch?v=i39jb9-DDPA",
  },
  {
    id: "hUwOD71YT2w",
    badge: "Aula Ciudad",
    title: "Responsabilidad de las autoridades urbanísticas",
    body: "El Dr. Emilio Urbina Mendoza explica la responsabilidad civil, administrativa y penal de las autoridades ante catástrofes y la falta de actualización de los planes.",
    href: "https://www.youtube.com/watch?v=hUwOD71YT2w",
  },
  {
    id: "awIfu2U_TMQ",
    badge: "Aula Ciudad",
    title: "El derecho urbanístico en Venezuela, cuatro décadas después",
    body: "Videoconferencia sobre el desmantelamiento de la planificación urbana, la mitigación de riesgos y la necesidad de reconstruir la capacidad técnica del Estado.",
    href: "https://www.youtube.com/watch?v=awIfu2U_TMQ",
  },
];

export const AULA_CIUDAD_HERO = {
  badge: "Formación académica",
  title: "Aula Ciudad",
  paragraphs: [
    "Aula Ciudad es una iniciativa académica de Universitas Fundación dedicada a la difusión y análisis de los temas jurídicos que impactan la gestión, regulación y desarrollo de las ciudades.",
    "Incluye un espacio especializado en Derecho Urbanístico, con contenidos orientados a la planificación territorial, la ordenación urbana y la gobernanza local.",
  ],
} as const;
