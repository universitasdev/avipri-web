import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { extractYoutubeId, parsePublishedAt, videoInputSchema } from "@/lib/admin/schemas";
import { parseJsonBody, safePublicUrl } from "@/lib/admin/safe";
import { getAdminVideos } from "@/lib/aula-ciudad/getVideos";

function revalidateVideos() {
  revalidatePath("/aula-ciudad");
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const videos = await getAdminVideos();
  return NextResponse.json({ videos });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

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

  const prisma = await getPrisma();
  const duplicate = await prisma.video.findFirst({ where: { youtubeId } });
  if (duplicate) {
    return NextResponse.json({ error: "Ese video ya está en el catálogo." }, { status: 409 });
  }

  const video = await prisma.video.create({
    data: {
      youtubeId,
      badge: parsed.data.badge,
      title: parsed.data.title,
      body: parsed.data.body,
      href: `https://www.youtube.com/watch?v=${youtubeId}`,
      thumbnail: safePublicUrl(parsed.data.thumbnail),
      publishedAt: parsed.data.publishedAt ? parsePublishedAt(parsed.data.publishedAt) : new Date(),
      published: parsed.data.published,
    },
  });

  revalidateVideos();
  return NextResponse.json({ video }, { status: 201 });
}
