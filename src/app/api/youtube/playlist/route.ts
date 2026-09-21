import { NextResponse } from "next/server";
import { getPlaylistVideosSafe } from "@/lib/youtube/playlist";

export async function GET() {
  const { videos, error, configured } = await getPlaylistVideosSafe();

  if (!configured) {
    return NextResponse.json(
      {
        error:
          "Configura YOUTUBE_API_KEY y PLAYLIST_ID en el entorno del servidor.",
        videos: [],
      },
      { status: 503 },
    );
  }

  if (error) {
    return NextResponse.json({ error, videos: [] }, { status: 500 });
  }

  return NextResponse.json({ videos });
}
