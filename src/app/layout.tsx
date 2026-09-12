import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { SiteShell } from "@/components/layout/SiteShell";
import "@/lib/fontawesome";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pdul.online"),
  title: {
    default: "PDUL Online",
    template: "%s | PDUL Online",
  },
  description:
    "Portal informativo, observatorio autónomo y plataforma de participación ciudadana para el Plan de Desarrollo Urbano Local del Municipio Iribarren.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable} h-full`}>
      <body className="min-h-full">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
