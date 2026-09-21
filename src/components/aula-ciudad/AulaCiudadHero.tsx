import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlay } from "@fortawesome/free-solid-svg-icons";
import { AULA_CIUDAD_HERO } from "@/lib/aula-ciudad/content";

export function AulaCiudadHero() {
  return (
    <section className="relative overflow-hidden bg-white pb-10 pt-14 sm:pb-12 sm:pt-16">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <FontAwesomeIcon icon={faCirclePlay} className="text-sm" />
            {AULA_CIUDAD_HERO.badge}
          </span>
          <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-brand-navy sm:text-4xl lg:text-5xl">
            {AULA_CIUDAD_HERO.title}
          </h1>
          <div className="mx-auto mt-5 max-w-2xl space-y-3">
            {AULA_CIUDAD_HERO.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="text-base italic leading-relaxed text-slate-600 sm:text-lg"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
