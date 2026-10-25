import type { z } from "zod";
import { extractYoutubeId, newsInputSchema } from "@/lib/admin/schemas";
import { safeNewsImagePath, safeNewsVideoPath, safePublicUrl } from "@/lib/admin/safe";

type NewsInput = z.infer<typeof newsInputSchema>;

// La noticia lleva foto O video (de YouTube o un archivo subido). Con video, la foto es su portada opcional.
function resolveMedia(input: NewsInput) {
  if (input.mediaType === "IMAGE") {
    return {
      ok: true as const,
      media: {
        mediaType: "IMAGE" as const,
        imageSrc: safeNewsImagePath(input.imageSrc),
        videoYoutubeId: null,
        videoFileSrc: null,
      },
    };
  }

  if (input.videoYoutube) {
    const youtubeId = extractYoutubeId(input.videoYoutube);
    if (!youtubeId) {
      return { ok: false as const, error: "El enlace de YouTube no es válido." };
    }
    return {
      ok: true as const,
      media: {
        mediaType: "VIDEO" as const,
        imageSrc: safeNewsImagePath(input.imageSrc),
        videoYoutubeId: youtubeId,
        videoFileSrc: null,
      },
    };
  }

  const fileSrc = safeNewsVideoPath(input.videoFileSrc);
  if (!fileSrc) {
    return {
      ok: false as const,
      error: "Agrega un enlace de YouTube o sube un archivo de video.",
    };
  }
  return {
    ok: true as const,
    media: {
      mediaType: "VIDEO" as const,
      imageSrc: safeNewsImagePath(input.imageSrc),
      videoYoutubeId: null,
      videoFileSrc: fileSrc,
    },
  };
}

/** Campos editables de la noticia (sin destacada ni autoría, que dependen del usuario). */
export function buildNewsData(input: NewsInput, publishedAt: Date) {
  const media = resolveMedia(input);
  if (!media.ok) return media;

  return {
    ok: true as const,
    data: {
      category: input.category,
      categoryLabel: input.categoryLabel,
      publishedAt,
      title: input.title,
      subtitle: input.subtitle,
      lead: input.lead || null,
      pointsLabel: input.pointsLabel || null,
      pointsJson: JSON.stringify(input.points),
      eventDetailsLabel: input.eventDetailsLabel || null,
      eventDetailsJson: input.eventDetails ? JSON.stringify(input.eventDetails) : null,
      cta: input.cta || null,
      href: safePublicUrl(input.href),
      imageAlt: input.imageAlt || null,
      published: input.published,
      ...media.media,
    },
  };
}
