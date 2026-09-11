import {
  faBookOpen,
  faNewspaper,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card } from "@/components/ui/Card";
import { IUS_URBANO_URL } from "@/lib/constants";
import type { NewsItem } from "@/lib/news/getNews";

const HIGHLIGHTS = [
  {
    title: "Aula Ciudad",
    body: "Próximas videoconferencias de formación ciudadana sobre el PDUL, la LOOU y la participación parroquial.",
    icon: faVideo,
  },
  {
    title: "Biblioteca Digital",
    body: "Últimas publicaciones, instrumentos legales y materiales técnicos disponibles en IUS Urbano.",
    href: IUS_URBANO_URL,
    icon: faBookOpen,
  },
  {
    title: "Avance del PDUL Barquisimeto",
    body: "La noticia más reciente sobre el proceso de formulación y armonización institucional del plan.",
    icon: faNewspaper,
  },
];

export function ObservatorioTeaser({ news }: { news: NewsItem[] }) {
  const featured = news[0];

  return (
    <section className="urban-pattern mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <span className="text-sm font-bold uppercase tracking-wider text-brand-terracotta">
          Especial PDUL Barquisimeto
        </span>
        <h1 className="mt-2 font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
          Observatorio y noticias
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-slate-600">
          Acceso directo a las noticias, videoconferencias de Aula Ciudad y
          avances del plan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {HIGHLIGHTS.map((item) => {
          const content = (
            <Card className="h-full p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-navy/5 text-brand-navy">
                <FontAwesomeIcon icon={item.icon} />
              </div>
              <h2 className="font-serif text-xl font-bold text-brand-navy">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {item.title === "Avance del PDUL Barquisimeto" && featured
                  ? featured.excerpt
                  : item.body}
              </p>
            </Card>
          );

          return item.href ? (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {content}
            </a>
          ) : (
            <div key={item.title}>{content}</div>
          );
        })}
      </div>
    </section>
  );
}
