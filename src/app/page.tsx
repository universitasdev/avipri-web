import { HeroSection } from "@/components/home/HeroSection";
import { ImpactSection } from "@/components/home/ImpactSection";
import { IusUrbanoSection } from "@/components/home/IusUrbanoSection";
import { StatusTracker } from "@/components/home/StatusTracker";

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatusTracker />
      <ImpactSection />
      <IusUrbanoSection />
    </>
  );
}
