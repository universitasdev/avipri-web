import { OBSERVATORIO_HERO } from "@/lib/observatorio/content";

export function ObservatorioHero() {
  return (
    <section className="observatorio-hero-photo relative overflow-hidden bg-brand-bone bg-cover bg-right pb-20 pt-16 sm:pb-24 sm:pt-20">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl lg:max-w-3xl">
          <span className="inline-block rounded-full border border-brand-terracotta/30 bg-brand-terracotta/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-terracotta">
            {OBSERVATORIO_HERO.badge}
          </span>
          <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-brand-navy drop-shadow-sm sm:text-4xl lg:text-5xl">
            {OBSERVATORIO_HERO.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            {OBSERVATORIO_HERO.subtitle}
          </p>
        </div>
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
