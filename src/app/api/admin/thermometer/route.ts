import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { thermometerInputSchema } from "@/lib/admin/schemas";
import { parseJsonBody } from "@/lib/admin/safe";
import { THERMOMETER_STEPS } from "@/lib/thermometer/steps";

function revalidateThermometer() {
  revalidatePath("/abc-pdul");
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const prisma = await getPrisma();
  const thermometer = await prisma.thermometer.findUnique({ where: { id: "default" } });
  return NextResponse.json({ thermometer, steps: THERMOMETER_STEPS });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await parseJsonBody(request);
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const parsed = thermometerInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa la fase y la descripción." }, { status: 400 });
  }

  const prisma = await getPrisma();
  const thermometer = await prisma.thermometer.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      activeIndex: parsed.data.activeIndex,
      activeTitle: parsed.data.activeTitle,
      activeDescription: parsed.data.activeDescription,
    },
    update: {
      activeIndex: parsed.data.activeIndex,
      activeTitle: parsed.data.activeTitle,
      activeDescription: parsed.data.activeDescription,
    },
  });

  revalidateThermometer();
  return NextResponse.json({ thermometer });
}
