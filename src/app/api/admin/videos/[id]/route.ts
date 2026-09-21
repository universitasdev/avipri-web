import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { extractYoutubeId, parsePublishedAt, videoInputSchema } from "@/lib/admin/schemas";
import { parseJsonBody, safePublicUrl } from "@/lib/admin/safe";

type RouteContext = { params: Promise<{ id: string }> };

function revalidateVideos() {
  revalidatePath("/aula-ciudad");
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const prisma = await getPrisma();
  const existing = await prisma.video.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Video no encontrado." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await parseJsonBody(request);
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const parsed = videoInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa los campos del video." }, { status: 400 });
  }

  const youtubeId = extractYoutubeId(parsed.data.youtube);
  if (!youtubeId) {
    return NextResponse.json({ error: "El enlace de YouTube no es válido." }, { status: 400 });
  }

  const duplicate = await prisma.video.findFirst({
    where: { youtubeId, NOT: { id } },
  });
  if (duplicate) {
    return NextResponse.json({ error: "Ese video ya está en el catálogo." }, { status: 409 });
  }

  const video = await prisma.video.update({
    where: { id },
    data: {
      youtubeId,
      badge: parsed.data.badge,
      title: parsed.data.title,
      body: parsed.data.body,
      href: `https://www.youtube.com/watch?v=${youtubeId}`,
      thumbnail: safePublicUrl(parsed.data.thumbnail),
      publishedAt: parsed.data.publishedAt ? parsePublishedAt(parsed.data.publishedAt) : existing.publishedAt,
      published: parsed.data.published,
    },
  });

  revalidateVideos();
  return NextResponse.json({ video });
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const prisma = await getPrisma();
  try {
    await prisma.video.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Video no encontrado." }, { status: 404 });
  }

  revalidateVideos();
  return NextResponse.json({ ok: true });
}
