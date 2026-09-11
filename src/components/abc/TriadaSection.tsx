import { Card } from "@/components/ui/Card";
import { TRIAD } from "@/lib/abc/content";

export function TriadaSection() {
  return (
    <section
      id="triada"
      className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8"
    >
      <header className="mx-auto mb-10 max-w-4xl text-center">
        <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
          La triada indivisible del PDUL
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-slate-600">
          De acuerdo con el artículo 34 de la LOOU, su Reglamento y la Guía
          MINFRA N° 139, el PDUL no es un documento aislado, sino una triada
          indisoluble compuesta por tres instrumentos interdependientes que
          deben formularse y aprobarse en simultáneo.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {TRIAD.map((item) => (
          <Card
            key={item.number}
            className="relative overflow-hidden border-b-4 border-b-transparent p-0 transition-all hover:-translate-y-1 hover:border-b-brand-terracotta hover:shadow-lg"
          >
            <div className="absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-br-xl bg-brand-navy font-bold text-white">
              {item.number}
            </div>
            <div className="px-7 pb-7 pt-14">
              <h3 className="font-serif text-2xl font-bold leading-snug text-brand-navy">
                {item.title}
              </h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-terracotta">
                {item.subtitle}
              </p>
              <div className="mt-4 text-sm leading-relaxed">
                <strong className="mb-1 block text-brand-navy">¿Qué es?</strong>
                <p className="text-slate-600">{item.body}</p>
              </div>
              <div className="mt-5 rounded-lg border border-dashed border-brand-border bg-brand-bone p-4 text-sm">
                <strong className="mb-1 block text-brand-navy">Contenido</strong>
                <p className="text-brand-text">{item.content}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
