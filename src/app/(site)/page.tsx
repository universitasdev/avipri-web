import { HeroSection } from "@/components/home/HeroSection";
import { ImpactSection } from "@/components/home/ImpactSection";
import { IusUrbanoSection } from "@/components/home/IusUrbanoSection";
import { NewsPromoSection } from "@/components/home/NewsPromoSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <NewsPromoSection />
      <ImpactSection />
      <IusUrbanoSection />
    </>
  );
}
