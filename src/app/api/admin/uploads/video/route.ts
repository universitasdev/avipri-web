import { handleDirectUpload } from "@/lib/storage/direct-upload-route";

function detectVideo(bytes: Buffer) {
  // MP4: caja "ftyp" a partir del byte 4.
  if (bytes.length >= 12 && bytes.toString("ascii", 4, 8) === "ftyp") return "mp4";
  // WebM (EBML): 1A 45 DF A3.
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return "webm";
  }
  return null;
}

export function POST(request: Request) {
  return handleDirectUpload(request, {
    kind: "video",
    detect: detectVideo,
    messages: {
      type: "Solo se admiten videos MP4 o WebM.",
      missing: "Selecciona un video.",
      invalid: "El archivo no es un video MP4 o WebM válido.",
      tooBig: "El video no puede superar 200 MB.",
    },
  });
}
