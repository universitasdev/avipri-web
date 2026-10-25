import { redirect } from "next/navigation";
import { ThermometerManager } from "@/components/admin/ThermometerManager";
import { isAdminRole } from "@/lib/auth/permissions";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getThermometer } from "@/lib/thermometer/getThermometer";

export default async function AdminThermometerPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !isAdminRole(admin)) redirect("/admin");

  const thermometer = await getThermometer();
  return (
    <ThermometerManager
      activeIndex={thermometer.activeIndex}
      activeTitle={thermometer.activeTitle}
      activeDescription={thermometer.activeDescription}
    />
  );
}
