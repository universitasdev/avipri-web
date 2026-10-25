import { handleDirectUpload } from "@/lib/storage/direct-upload-route";

function detectPdf(bytes: Buffer) {
  return bytes.length >= 5 && bytes.toString("ascii", 0, 5) === "%PDF-" ? "pdf" : null;
}

export function POST(request: Request) {
  return handleDirectUpload(request, {
    kind: "document",
    detect: detectPdf,
    messages: {
      type: "Solo se admiten archivos PDF.",
      missing: "Selecciona un PDF.",
      invalid: "El archivo no es un PDF válido.",
      tooBig: "El PDF no puede superar 20 MB.",
    },
  });
}
