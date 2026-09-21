import { getPrisma } from "@/lib/db";
import {
  DEFAULT_THERMOMETER,
  buildThermometerView,
} from "@/lib/thermometer/steps";

export async function getThermometer() {
  try {
    const prisma = await getPrisma();
    const row = await prisma.thermometer.findUnique({ where: { id: "default" } });
    if (!row) return buildThermometerView(DEFAULT_THERMOMETER);
    return buildThermometerView({
      activeIndex: row.activeIndex,
      activeTitle: row.activeTitle,
      activeDescription: row.activeDescription,
    });
  } catch {
    return buildThermometerView(DEFAULT_THERMOMETER);
  }
}
