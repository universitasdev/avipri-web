import {
  faBuildingShield,
  faChartLine,
  faFaucetDrip,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Card } from "@/components/ui/Card";

const IMPACTS: {
  title: string;
  body: string;
  icon: IconDefinition;
  tone: string;
}[] = [
  {
    title: "Valor del suelo",
    body: "Normas claras que protegen la propiedad privada, evitan la especulación y garantizan la seguridad jurídica de tu inversión inmobiliaria.",
    icon: faChartLine,
    tone: "bg-brand-navy/5 text-brand-navy group-hover:bg-brand-navy group-hover:text-white",
  },
  {
    title: "Variables Urbanas (VUF)",
    body: "Orientación precisa sobre usos del suelo, alturas permitidas, retiros y densidad edificable para trámites ante la DPCU.",
    icon: faBuildingShield,
    tone: "bg-brand-success/10 text-brand-success group-hover:bg-brand-success group-hover:text-white",
  },
  {
    title: "Servicios públicos",
    body: "Planificación territorial adaptada a la capacidad real de las redes de agua, electricidad, drenajes pluviales y vialidad local.",
    icon: faFaucetDrip,
    tone: "bg-brand-terracotta/10 text-brand-terracotta group-hover:bg-brand-terracotta group-hover:text-white",
  },
  {
    title: "Incentivos comerciales",
    body: "Nuevas oportunidades de uso mixto, cronotopía y simplificación de trámites para el desarrollo comercial e industrial.",
    icon: faStore,
    tone: "bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white",
  },
];

export function ImpactSection() {
  return (
    <section id="impacto" className="urban-pattern mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <h2 className="mb-4 font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
          ¿En qué te afecta o beneficia el nuevo PDUL?
        </h2>
        <p className="text-slate-600">
          Comprende cómo las nuevas normativas urbanísticas impactarán
          directamente en tu calidad de vida, tus propiedades y tus
          emprendimientos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {IMPACTS.map((item) => (
          <Card
            key={item.title}
            className="group p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div
              className={`mb-6 flex h-14 w-14 items-center justify-center rounded-lg text-2xl transition-colors ${item.tone}`}
            >
              <FontAwesomeIcon icon={item.icon} />
            </div>
            <h3 className="mb-3 text-lg font-bold text-brand-text">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">{item.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
