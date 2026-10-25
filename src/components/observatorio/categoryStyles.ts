import {
  faBookOpen,
  faBuilding,
  faGraduationCap,
  faRulerCombined,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { NewsCategory } from "@/lib/observatorio/content";

/**
 * Paleta de las categorías. Cada categoría guarda una de estas claves en la base; las nuevas
 * reciben la siguiente libre, así que el equipo editorial no tiene que elegir colores.
 * Las clases van completas (sin armar con strings) para que Tailwind las genere.
 */
const PALETTE = {
  navy: {
    chip: "border-blue-100 bg-blue-50 text-brand-navy",
    fill: "bg-brand-navy",
    fillIcon: "text-white/10",
  },
  terracotta: {
    chip: "border-orange-200 bg-orange-50 text-orange-900",
    fill: "bg-brand-terracotta",
    fillIcon: "text-white/15",
  },
  territorial: {
    chip: "border-emerald-200 bg-emerald-50 text-emerald-800",
    fill: "bg-brand-territorial",
    fillIcon: "text-white/15",
  },
  orange: {
    chip: "border-amber-200 bg-amber-50 text-amber-900",
    fill: "bg-brand-orange",
    fillIcon: "text-brand-navy/15",
    dark: true,
  },
  plum: {
    chip: "border-purple-200 bg-purple-50 text-purple-800",
    fill: "bg-purple-800",
    fillIcon: "text-white/15",
  },
  sky: {
    chip: "border-sky-200 bg-sky-50 text-sky-800",
    fill: "bg-sky-700",
    fillIcon: "text-white/15",
  },
  olive: {
    chip: "border-lime-200 bg-lime-50 text-lime-900",
    fill: "bg-lime-800",
    fillIcon: "text-white/15",
  },
  slate: {
    chip: "border-slate-200 bg-slate-100 text-slate-800",
    fill: "bg-slate-700",
    fillIcon: "text-white/15",
  },
} as const;

export type CategoryColor = keyof typeof PALETTE;

/** Orden en que se reparten los colores a las categorías nuevas. */
export const CATEGORY_COLORS = Object.keys(PALETTE) as CategoryColor[];

const ICONS: Record<string, IconDefinition> = {
  building: faBuilding,
  book: faBookOpen,
  ruler: faRulerCombined,
  graduation: faGraduationCap,
};

export function categoryStyle(category: Pick<NewsCategory, "color" | "icon">) {
  const palette = PALETTE[category.color as CategoryColor] ?? PALETTE.slate;
  return {
    chip: palette.chip,
    fill: palette.fill,
    fillIcon: palette.fillIcon,
    dark: "dark" in palette ? palette.dark : false,
    icon: (category.icon && ICONS[category.icon]) || faTag,
  };
}
