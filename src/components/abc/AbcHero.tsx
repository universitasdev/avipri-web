import {
  faCircleQuestion,
  faLayerGroup,
  faLightbulb,
  faMicroscope,
  faPuzzlePiece,
  faRoute,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { ABC_NAV } from "@/lib/abc/content";

const NAV_ICONS: IconDefinition[] = [
  faLightbulb,
  faLayerGroup,
  faRoute,
  faMicroscope,
  faPuzzlePiece,
  faCircleQuestion,
];

export function AbcHero() {
  return (
    <section className="abc-hero-photo relative overflow-hidden bg-brand-bone bg-cover bg-right pb-20 pt-16 sm:pb-24 sm:pt-20">
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-wider text-brand-terracotta">
          El ABC del PDUL
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-brand-navy drop-shadow-sm sm:text-4xl lg:text-5xl">
          Comprendiendo cómo un Plan de Desarrollo Urbano Local (PDUL)
          transforma a una ciudad.
        </h1>
        <nav
          aria-label="Navegación rápida del ABC"
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          {ABC_NAV.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-white/90 px-4 py-2 text-sm font-medium text-brand-navy shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-brand-navy hover:bg-brand-navy hover:text-white"
            >
              <FontAwesomeIcon icon={NAV_ICONS[index]} className="text-xs" />
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="absolute bottom-0 left-0 w-full rotate-180 overflow-hidden leading-none">
        <svg
          className="relative block h-[50px] w-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="#F8FAFC"
          />
        </svg>
      </div>
    </section>
  );
}
