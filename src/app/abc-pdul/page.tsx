import type { Metadata } from "next";
import { AbcHero } from "@/components/abc/AbcHero";
import { EstudiosSection } from "@/components/abc/EstudiosSection";
import { FaqSection } from "@/components/abc/FaqSection";
import { FundamentosSection } from "@/components/abc/FundamentosSection";
import { MicrolearningSection } from "@/components/abc/MicrolearningSection";
import { MitosSection } from "@/components/abc/MitosSection";
import { ProcedimientoSection } from "@/components/abc/ProcedimientoSection";
import { TriadaSection } from "@/components/abc/TriadaSection";

export const metadata: Metadata = {
  title: "El ABC del PDUL | PDUL Iribarren",
  description:
    "Qué es el Plan de Desarrollo Urbano Local de Iribarren, su triada legal, el procedimiento de 24 meses, los estudios técnicos y las preguntas frecuentes.",
};

export default function AbcPdulPage() {
  return (
    <div className="urban-pattern">
      <AbcHero />
      <FundamentosSection />
      <TriadaSection />
      <ProcedimientoSection />
      <EstudiosSection />
      <MitosSection />
      <FaqSection />
      <MicrolearningSection />
    </div>
  );
}
