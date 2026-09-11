import { HeroSection } from "@/components/home/HeroSection";
import { ImpactSection } from "@/components/home/ImpactSection";
import { RegistrationSection } from "@/components/home/RegistrationSection";
import { StatusTracker } from "@/components/home/StatusTracker";

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatusTracker />
      <ImpactSection />
      <RegistrationSection />
    </>
  );
}
