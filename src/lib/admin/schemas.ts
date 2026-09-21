import { z } from "zod";

const newsPointSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(4000),
});

export const newsInputSchema = z.object({
  category: z.enum(["institucional", "doctrina", "vuf", "aula"]),
  categoryLabel: z.string().trim().min(2).max(80),
  publishedAt: z.string().trim().min(8).max(40),
  title: z.string().trim().min(8).max(300),
  subtitle: z.string().trim().min(8).max(600),
  lead: z.string().trim().max(6000).optional().nullable(),
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

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(120)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  password: z.string().min(8).max(72),
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
