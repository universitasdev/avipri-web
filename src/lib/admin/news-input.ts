import type { z } from "zod";
import { extractYoutubeId, newsInputSchema } from "@/lib/admin/schemas";
import {
  safeNewsDocumentPath,
  safeNewsImagePath,
  safeNewsVideoPath,
  safePublicUrl,
} from "@/lib/admin/safe";

type NewsInput = z.infer<typeof newsInputSchema>;

type Failure = { ok: false; error: string };

/**
 * La noticia lleva fotos O video. Con fotos, 1 es foto y 2 o más es galería; con video
 * (de YouTube o un archivo subido), imageSrc es su portada opcional.
 */
function resolveMedia(input: NewsInput) {
  if (input.mediaType === "IMAGE") {
    const images: { src: string; alt: string | null; position: number }[] = [];
    for (const [position, image] of input.images.entries()) {
      const src = safeNewsImagePath(image.src);
      if (!src) return { ok: false, error: "Una de las fotos no es válida." } satisfies Failure;
      images.push({ src, alt: image.alt || null, position });
    }
    return {
      ok: true as const,
      images,
      media: {
        mediaType: "IMAGE" as const,
        imageSrc: null,
        videoYoutubeId: null,
        videoFileSrc: null,
      },
    };
  }

  const poster = safeNewsImagePath(input.imageSrc);

  if (input.videoYoutube) {
    const youtubeId = extractYoutubeId(input.videoYoutube);
    if (!youtubeId) {
      return { ok: false, error: "El enlace de YouTube no es válido." } satisfies Failure;
    }
    return {
      ok: true as const,
      images: [],
      media: {
        mediaType: "VIDEO" as const,
        imageSrc: poster,
        videoYoutubeId: youtubeId,
        videoFileSrc: null,
      },
    };
  }

  const fileSrc = safeNewsVideoPath(input.videoFileSrc);
  if (!fileSrc) {
    return {
      ok: false,
      error: "Agrega un enlace de YouTube o sube un archivo de video.",
    } satisfies Failure;
  }
  return {
    ok: true as const,
    images: [],
    media: {
      mediaType: "VIDEO" as const,
      imageSrc: poster,
      videoYoutubeId: null,
      videoFileSrc: fileSrc,
    },
  };
}

function resolveAttachment(input: NewsInput) {
  if (!input.attachment) {
    return {
      ok: true as const,
      attachment: { attachmentSrc: null, attachmentName: null, attachmentBytes: null },
    };
  }
  const src = safeNewsDocumentPath(input.attachment.src);
  if (!src) return { ok: false, error: "El PDF adjunto no es válido." } satisfies Failure;
  return {
    ok: true as const,
    attachment: {
      attachmentSrc: src,
      attachmentName: input.attachment.name,
      attachmentBytes: input.attachment.bytes,
    },
  };
}

/**
 * Campos editables de la noticia (sin destacada ni autoría, que dependen del usuario).
 * Las fotos van aparte porque se guardan en NewsImage.
 */
export function buildNewsData(input: NewsInput, publishedAt: Date) {
  const media = resolveMedia(input);
  if (!media.ok) return media;
  const attachment = resolveAttachment(input);
  if (!attachment.ok) return attachment;

  return {
    ok: true as const,
    images: media.images,
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
      ...attachment.attachment,
    },
  };
}
