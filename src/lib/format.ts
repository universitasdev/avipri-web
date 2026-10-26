const sizeFormat = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 1 });

/** Peso legible de un archivo: "850 KB", "3,2 MB". */
export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${sizeFormat.format(bytes / (1024 * 1024))} MB`;
}
