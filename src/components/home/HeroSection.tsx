import { faNewspaper, faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { IUS_URBANO_REGISTER_URL } from "@/lib/constants";

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="hero-photo relative overflow-hidden bg-brand-navy bg-cover bg-center pb-28 pt-20 lg:pb-40 lg:pt-32"
    >
      <div className="hero-photo-overlay pointer-events-none absolute inset-0 z-[1]" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="mb-6 font-serif text-4xl font-bold leading-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
          Transformando el territorio con inteligencia legal y urbanística.
        </h1>
        <p className="mx-auto mb-10 max-w-3xl text-lg font-light text-slate-300 sm:text-xl">
          Portal informativo, observatorio autónomo y plataforma de
          participación ciudadana para la Planificación del Desarrollo Urbano
          Local (PDUL) en Venezuela.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/observatorio"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-terracotta px-8 py-3.5 font-medium text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-orange-800 sm:w-auto"
          >
            <FontAwesomeIcon icon={faNewspaper} /> Observatorio PDUL
          </Link>
          <a
            href={IUS_URBANO_REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-8 py-3.5 font-medium text-brand-navy shadow-lg transition-all hover:-translate-y-1 hover:bg-slate-100 sm:w-auto"
          >
            <FontAwesomeIcon icon={faRobot} /> Consulta IUS Urbano
          </a>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 z-10 w-full rotate-180 overflow-hidden leading-none">
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
