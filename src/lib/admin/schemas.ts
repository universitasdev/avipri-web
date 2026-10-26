import { z } from "zod";
import { isStrongPassword, PASSWORD_MAX_LENGTH, PASSWORD_POLICY_TEXT } from "@/lib/auth/password-policy";

const newsPointSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(4000),
});

export const newsInputSchema = z.object({
  categoryId: z.string().trim().min(1).max(60),
  // Etiquetas por nombre; el servidor reutiliza las existentes y crea las nuevas.
  tags: z.array(z.string().trim().min(1).max(60)).max(10).default([]),
  // Reseña de un artículo de otra revista: los dos campos van juntos.
  externalSource: z.string().trim().max(120).optional().nullable(),
  externalUrl: z.string().trim().max(500).optional().nullable(),
  publishedAt: z.string().trim().min(8).max(40),
  title: z.string().trim().min(8).max(300),
  subtitle: z.string().trim().min(8).max(600),
  // Cabe una nota completa (unas 3.000 palabras).
  // Con formato es HTML, que ocupa más que el texto solo.
  lead: z.string().trim().max(60000).optional().nullable(),
  pointsLabel: z.string().trim().max(120).optional().nullable(),
  points: z.array(newsPointSchema).max(12).default([]),
  eventDetailsLabel: z.string().trim().max(120).optional().nullable(),
  eventDetails: z.array(newsPointSchema).max(8).optional().nullable(),
  cta: z.string().trim().max(160).optional().nullable(),
  href: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
  imageSrc: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
  imageAlt: z.string().trim().max(200).optional().nullable(),
  // Fotos de la noticia en orden; la primera es la portada. Con 2 o más es galería.
  images: z
    .array(
      z.object({
        src: z.string().trim().min(1).max(500),
        alt: z.string().trim().max(200).optional().nullable(),
      }),
    )
    .max(12)
    .default([]),
  attachment: z
    .object({
      src: z.string().trim().min(1).max(500),
      name: z.string().trim().min(1).max(200),
      bytes: z.number().int().positive().max(20 * 1024 * 1024),
    })
    .optional()
    .nullable(),
  mediaType: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  // Enlace o ID de YouTube; el servidor extrae el ID.
  videoYoutube: z.string().trim().max(200).optional().nullable(),
  videoFileSrc: z.string().trim().max(500).optional().nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

export const videoInputSchema = z.object({
  youtube: z.string().trim().min(11).max(200),
  badge: z.string().trim().min(2).max(40).default("Aula Ciudad"),
  title: z.string().trim().min(8).max(200),
  body: z.string().trim().min(8).max(2000),
  thumbnail: z.string().trim().max(400).optional().nullable(),
  publishedAt: z.string().trim().max(40).optional().nullable(),
  published: z.boolean().default(true),
});

export const thermometerInputSchema = z.object({
  activeIndex: z.number().int().min(0).max(6),
  activeTitle: z.string().trim().min(4).max(160),
  activeDescription: z.string().trim().min(8).max(600),
});

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(120)
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

// Para entrar y para la contraseña actual: las viejas siguen sirviendo.
const passwordSchema = z.string().min(1).max(PASSWORD_MAX_LENGTH);
// Toda contraseña nueva (al crear, resetear o cambiar) cumple las reglas de seguridad.
const newPasswordSchema = z.string().refine(isStrongPassword, PASSWORD_POLICY_TEXT);

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const userRoleSchema = z.enum(["ADMIN", "EDITOR"]);

export const userCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailSchema,
  role: userRoleSchema.default("EDITOR"),
  password: newPasswordSchema,
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  role: userRoleSchema.optional(),
  active: z.boolean().optional(),
  password: newPasswordSchema.optional(),
});

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(60),
});

export const passwordChangeSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: newPasswordSchema,
});

export function extractYoutubeId(input: string) {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace(/^\//, "").slice(0, 11);
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    const queryId = url.searchParams.get("v");
    if (queryId && /^[a-zA-Z0-9_-]{11}$/.test(queryId)) return queryId;
    const embed = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embed?.[1]) return embed[1];
    const shorts = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shorts?.[1]) return shorts[1];
  } catch {
    return null;
  }

  return null;
}

export function parsePublishedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Fecha inválida");
  }
  return date;
}
