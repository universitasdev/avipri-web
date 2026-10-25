import Link from "next/link";
import { Newspaper, Thermometer, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { getAdminUsers } from "@/lib/admin/users";
import { isAdminRole } from "@/lib/auth/permissions";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getAdminNews } from "@/lib/observatorio/getNews";
import { getThermometer } from "@/lib/thermometer/getThermometer";

export default async function AdminHomePage() {
  const admin = await getCurrentAdmin();
  const isAdmin = admin ? isAdminRole(admin) : false;
  const [news, thermometer, users] = await Promise.all([
    getAdminNews(),
    getThermometer(),
    isAdmin ? getAdminUsers() : Promise.resolve([]),
  ]);
  const ownNews = news.filter((article) => article.createdById === admin?.id).length;

  const cards = [
    {
      href: "/admin/noticias",
      title: "Noticias",
      value: isAdmin ? `${news.length}` : `${ownNews}`,
      hint: isAdmin ? "Observatorio y portada" : `Tuyas · ${news.length} en total`,
      icon: Newspaper,
    },
    ...(isAdmin
      ? [
          {
            href: "/admin/termometro",
            title: "Termómetro",
            value: thermometer.steps[thermometer.activeIndex]?.label ?? "—",
            hint: "Fase en curso en El ABC",
            icon: Thermometer,
          },
          {
            href: "/admin/usuarios",
            title: "Usuarios",
            value: `${users.filter((user) => user.active).length}`,
            hint: "Cuentas activas del panel",
            icon: Users,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-brand-navy">Resumen</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Publica sin tocar código. Los cambios se ven en el sitio público al guardar.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <card.icon className="h-5 w-5 text-brand-terracotta" />
                <CardTitle className="mt-3">{card.title}</CardTitle>
                <CardDescription>{card.hint}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-brand-navy">{card.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
