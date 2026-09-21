import { faNewspaper } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export function NewsPromoSection() {
  return (
    <section
      id="noticias"
      className="relative z-20 mx-auto -mt-16 mb-20 max-w-6xl px-4 sm:px-6 lg:px-8"
    >
      <div className="relative overflow-hidden rounded-xl bg-brand-navy p-8 text-white shadow-lg sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 max-w-3xl">
          <h2 className="mb-3 flex items-center gap-3 font-serif text-2xl font-bold sm:text-3xl">
            <FontAwesomeIcon icon={faNewspaper} className="text-brand-orange" />
            Observatorio y noticias
          </h2>
          <p className="text-base text-slate-300 sm:text-lg">
            Análisis de coyuntura, doctrina urbanística y reportes de avance del
            PDUL Iribarren. El seguimiento técnico e institucional del plan, en un
            solo lugar.
          </p>
        </div>
        <div className="relative z-10 mt-6 shrink-0 lg:mt-0">
          <Link
            href="/observatorio"
            className="inline-flex items-center rounded-lg border border-white/20 bg-white/20 px-6 py-3 text-sm font-medium transition-colors hover:bg-white/30"
          >
            Ir al Observatorio →
          </Link>
        </div>
      </div>
    </section>
  );
}
