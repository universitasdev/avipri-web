import {
  faBuilding,
  faFaucetDrip,
  faLock,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Card } from "@/components/ui/Card";
import { BENEFITS, LEGAL_HIERARCHY } from "@/lib/abc/content";

const BENEFIT_ICONS: IconDefinition[] = [faLock, faBuilding, faFaucetDrip, faUsers];

export function FundamentosSection() {
  return (
    <section
      id="fundamentos"
      className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8"
    >
      <header className="mx-auto mb-10 max-w-4xl text-center">
        <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
          <span className="font-sans text-[0.85em]">1.</span> ¿Qué es un PDUL y
          por qué es crucial para Barquisimeto?
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          El Plan de Desarrollo Urbano Local (PDUL) es el instrumento jurídico y
          técnico mediante el cual el Municipio organiza, regula y orienta el uso
          del suelo, la expansión física, los servicios públicos y la edificación
          en la ciudad de Barquisimeto para un horizonte estratégico de 20 años
          (2026–2046).
        </p>
        <p className="mt-3 text-lg leading-relaxed text-slate-600">
          No se trata de un simple conjunto de mapas o intenciones políticas; es
          la ley marco municipal del suelo que otorga certeza jurídica a la
          propiedad privada, fija las reglas para la inversión inmobiliaria y
          comercial, y programa la infraestructura requerida por la comunidad.
        </p>
      </header>

      <Card className="mb-8 p-6 sm:p-10">
        <h3 className="text-lg font-bold text-brand-navy">
          ¿Por qué es indispensable para el desarrollo de Iribarren?
        </h3>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {BENEFITS.map((item, index) => (
            <div
              key={item.title}
              className="rounded-lg border-l-4 border-brand-terracotta bg-brand-bone p-5"
            >
              <h4 className="mb-2 flex items-center gap-2 font-bold text-brand-navy">
                <FontAwesomeIcon
                  icon={BENEFIT_ICONS[index]}
                  className="text-brand-orange"
                />
                {item.title}
              </h4>
              <p className="text-sm leading-relaxed text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 sm:p-10">
        <h3 className="font-serif text-2xl font-bold text-brand-navy">
          Naturaleza jurídica y marco de obligatorio cumplimiento
        </h3>
        <p className="mt-3 text-slate-600">
          El PDUL posee una jerarquía normativa superior dentro del
          ordenamiento local, derivado de la autonomía municipal protegida por
          la Constitución de la República Bolivariana de Venezuela (CRBV). Cada
          disposición del plan se fundamenta en un andamio legal estricto:
        </p>
        <div className="legal-scaffold mt-8 space-y-4 overflow-hidden rounded-xl p-6 text-white sm:p-8">
          {LEGAL_HIERARCHY.map((item, index) => (
            <div key={item.title} className="relative">
              <div className="rounded-lg border border-white/20 bg-white/10 p-5">
                <h4 className="font-bold text-brand-orange">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-white">
                  {item.body}
                </p>
              </div>
              {index < LEGAL_HIERARCHY.length - 1 ? (
                <div
                  aria-hidden="true"
                  className="flex justify-center py-1 text-brand-orange"
                >
                  ▼
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
