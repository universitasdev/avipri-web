import {
  faBookOpen,
  faBuilding,
  faGraduationCap,
  faRulerCombined,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { NewsCategoryId } from "@/lib/observatorio/content";

export const CATEGORY_STYLES: Record<
  NewsCategoryId,
  { chip: string; icon: IconDefinition }
> = {
  institucional: {
    chip: "border-blue-100 bg-blue-50 text-brand-navy",
    icon: faBuilding,
  },
  doctrina: {
    chip: "border-amber-200 bg-amber-50 text-amber-800",
    icon: faBookOpen,
  },
  vuf: {
    chip: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: faRulerCombined,
  },
  aula: {
    chip: "border-purple-200 bg-purple-50 text-purple-800",
    icon: faGraduationCap,
  },
};
