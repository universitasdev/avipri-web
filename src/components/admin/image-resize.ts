"use client";

/** Lado mayor máximo: suficiente para pantallas grandes y liviano para la web. */
const MAX_SIDE = 2400;
/** Por debajo de este ancho la foto puede verse borrosa en la portada. */
export const MIN_RECOMMENDED_WIDTH = 1200;
/** El servidor acepta hasta 3 MB; se deja margen. */
const TARGET_BYTES = 2.8 * 1024 * 1024;
const READABLE = ["image/jpeg", "image/png", "image/webp"];

export type PreparedImage = {
  file: File;
  width: number;
  height: number;
  /** La foto es más angosta que lo recomendado (se sube igual). */
  small: boolean;
};

function toBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

/**
 * Deja la foto lista para subir: si es muy grande (en píxeles o en peso) la achica y la
 * comprime a JPEG en el navegador. Así el equipo editorial puede usar las fotos tal como
 * salen del teléfono o la cámara, sin preocuparse por medidas ni pesos.
 */
export async function prepareImage(file: File): Promise<PreparedImage> {
  const type = file.type || (/\.(jpe?g)$/i.test(file.name) ? "image/jpeg" : "");
  if (!READABLE.includes(type)) {
    throw new Error(
      `«${file.name}» no es JPG, PNG ni WebP. Si viene de un iPhone (HEIC), envíala como JPG o haz una captura.`,
    );
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`No se pudo leer «${file.name}». Prueba con otra foto o guárdala de nuevo como JPG.`);
  }

  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const small = width * scale < MIN_RECOMMENDED_WIDTH;

  if (scale === 1 && file.size <= TARGET_BYTES) {
    bitmap.close();
    return { file, width, height, small };
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext("2d")!;
  // Fondo blanco: un PNG con transparencia no queda negro al pasar a JPEG.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let blob: Blob | null = null;
  for (const quality of [0.85, 0.75, 0.65]) {
    blob = await toBlob(canvas, quality);
    if (blob && blob.size <= TARGET_BYTES) break;
  }
  if (!blob) throw new Error(`No se pudo preparar «${file.name}».`);

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return {
    file: new File([blob], name, { type: "image/jpeg", lastModified: Date.now() }),
    width: canvas.width,
    height: canvas.height,
    small,
  };
}
