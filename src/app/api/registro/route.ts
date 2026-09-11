import { NextResponse } from "next/server";
import { registrationSchema } from "@/lib/registrations/schema";
import { submitRegistration } from "@/lib/registrations/store";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Los datos del formulario no son válidos." },
        { status: 400 },
      );
    }

    const result = await submitRegistration(parsed.data);

    if (!result.ok) {
      return NextResponse.json(result, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "No se pudo procesar el registro." },
      { status: 500 },
    );
  }
}
