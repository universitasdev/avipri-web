import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IUS_URBANO_LOGIN_URL } from "@/lib/constants";

export function IusUrbanoSection() {
  return (
    <section id="registro" className="border-y border-brand-border bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-xl bg-brand-navy p-8 text-white shadow-lg sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 max-w-3xl">
            <h2 className="mb-3 flex items-center gap-3 font-serif text-2xl font-bold sm:text-3xl">
              <FontAwesomeIcon icon={faRobot} className="text-brand-orange" />
              Consulta a IUS Urbano IA
            </h2>
            <p className="text-base text-slate-300 sm:text-lg">
              ¿Tienes dudas sobre los requisitos legales para participar según
              el Art. 38 de la LOOU?
            </p>
          </div>
          <div className="relative z-10 mt-6 shrink-0 lg:mt-0">
            <a
              href={IUS_URBANO_LOGIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-white/20 bg-white/20 px-6 py-3 text-sm font-medium transition-colors hover:bg-white/30"
            >
              Preguntar a IUS Urbano →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
