import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/auth/request";
import { getEngagement, setReaction } from "@/lib/observatorio/engagement";

type RouteContext = { params: Promise<{ slug: string }> };

const NO_STORE = { "Cache-Control": "no-store" };
const reactionSchema = z.object({ reaccion: z.enum(["like", "dislike"]).nullable() });

function notFound() {
  return NextResponse.json({ error: "Noticia no encontrada." }, { status: 404, headers: NO_STORE });
}

/** Totales y el voto de este lector, sin sumar vista. */
export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const engagement = await getEngagement(slug, { countView: false });
  return engagement ? NextResponse.json(engagement, { headers: NO_STORE }) : notFound();
}

/** Suma una vista (el navegador la envía una vez por sesión) y devuelve los totales. */
export async function POST(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  const { slug } = await context.params;
  const engagement = await getEngagement(slug, { countView: true });
  return engagement ? NextResponse.json(engagement, { headers: NO_STORE }) : notFound();
}

/** «Me gusta», «No me gusta» o quitar el voto (null). */
export async function PUT(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const parsed = reactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Voto inválido." }, { status: 400 });
  }

  const { slug } = await context.params;
  const engagement = await setReaction(slug, parsed.data.reaccion);
  return engagement ? NextResponse.json(engagement, { headers: NO_STORE }) : notFound();
}
