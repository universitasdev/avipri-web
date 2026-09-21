import { ThermometerManager } from "@/components/admin/ThermometerManager";
import { getThermometer } from "@/lib/thermometer/getThermometer";

export default async function AdminThermometerPage() {
  const thermometer = await getThermometer();
  return (
    <ThermometerManager
      activeIndex={thermometer.activeIndex}
      activeTitle={thermometer.activeTitle}
      activeDescription={thermometer.activeDescription}
    />
  );
}
