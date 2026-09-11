/** Cédula venezolana: opcional V/E y solo dígitos. */
export function sanitizeCedula(value: string) {
  const upper = value.toUpperCase();
  const prefix = upper.startsWith("V") || upper.startsWith("E") ? upper[0] : "";
  const digits = (prefix ? upper.slice(1) : upper).replace(/\D/g, "").slice(0, 9);

  if (prefix && digits) return `${prefix}-${digits}`;
  if (prefix) return prefix;
  return digits;
}

/** Teléfono: solo + inicial y números. */
export function sanitizePhone(value: string) {
  const hasPlus = value.trim().startsWith("+");
  const digits = value.replace(/\D/g, "").slice(0, 15);
  return hasPlus ? `+${digits}` : digits;
}

/** RIF: letra J/G/V/E/P/C y dígitos. */
export function sanitizeRif(value: string) {
  const upper = value.toUpperCase().replace(/[^JGVEPC0-9-]/g, "");
  const letterMatch = upper.match(/^[JGVEPC]/);
  const letter = letterMatch?.[0] ?? "";
  const digits = (letter ? upper.slice(1) : upper).replace(/\D/g, "").slice(0, 10);

  if (!letter) return digits;
  if (digits.length <= 8) return digits ? `${letter}-${digits}` : letter;
  return `${letter}-${digits.slice(0, 8)}-${digits.slice(8)}`;
}

/** Nombres: solo letras, espacios y acentos. */
export function sanitizeName(value: string) {
  return value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]/g, "");
}
