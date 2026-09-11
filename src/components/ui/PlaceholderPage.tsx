import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SITE_SECTIONS } from "@/lib/constants";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const others = SITE_SECTIONS.filter((item) => item.title !== title);

  return (
    <div className="urban-pattern mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-wider text-brand-terracotta">
        Módulo en preparación
      </p>
      <h1 className="mt-3 font-serif text-4xl font-bold text-brand-navy">{title}</h1>
      <p className="mt-4 max-w-3xl text-lg text-slate-600">{description}</p>
      <Card className="mt-10 p-6 text-slate-600">
        El diseño de esta sección aún está en fase de prototipo. La ruta ya
        existe para que el mapa del sitio crezca sin reescribir el portal.
      </Card>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {others.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full p-5 transition-all hover:-translate-y-1 hover:shadow-lg">
              <h2 className="font-bold text-brand-navy">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
