/**
 * Reglas de una contraseña nueva. Las comparten el servidor (validación) y el panel
 * (lista de requisitos y avisos), para que digan exactamente lo mismo.
 * No se aplican al iniciar sesión: las contraseñas viejas siguen sirviendo para entrar.
 */
export const PASSWORD_MIN_LENGTH = 8;
// bcrypt solo usa los primeros 72 bytes.
export const PASSWORD_MAX_LENGTH = 72;

export const PASSWORD_RULES = [
  {
    id: "length",
    label: `Al menos ${PASSWORD_MIN_LENGTH} caracteres`,
    missing: `${PASSWORD_MIN_LENGTH} caracteres como mínimo`,
    test: (value: string) => value.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "upper",
    label: "Una letra mayúscula (A-Z)",
    missing: "una letra mayúscula",
    test: (value: string) => /\p{Lu}/u.test(value),
  },
  {
    id: "symbol",
    label: "Un símbolo, como ! @ # $ % & * ?",
    missing: "un símbolo (por ejemplo ! @ # $)",
    test: (value: string) => /[^\p{L}\p{N}\s]/u.test(value),
  },
] as const;

export const PASSWORD_POLICY_TEXT = `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres, una letra mayúscula y un símbolo.`;

/** Lo que le falta a la contraseña, en palabras ("una letra mayúscula", …). Vacío si cumple. */
export function passwordProblems(value: string) {
  const problems: string[] = PASSWORD_RULES.filter((rule) => !rule.test(value)).map(
    (rule) => rule.missing,
  );
  if (value.length > PASSWORD_MAX_LENGTH) {
    problems.push(`no más de ${PASSWORD_MAX_LENGTH} caracteres`);
  }
  return problems;
}

export function isStrongPassword(value: string) {
  return passwordProblems(value).length === 0;
}

/** "a, b y c" */
export function joinSpanish(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}
