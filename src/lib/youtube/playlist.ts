import { unstable_cache } from "next/cache";
import type { YoutubeVideoItem } from "@/lib/youtube/types";

const CACHE_TTL_SECONDS = 60 * 60;
export const YOUTUBE_PLAYLIST_CACHE_TAG = "youtube-playlist";

type YtThumbnail = { url: string; width?: number; height?: number };

type YtSnippet = {
  title: string;
  description: string;
  position: number;
  thumbnails?: {
    high?: YtThumbnail;
    medium?: YtThumbnail;
    default?: YtThumbnail;
  };
  resourceId?: {
    kind: string;
    videoId: string;
  };
};

type YtPlaylistItem = { snippet: YtSnippet };

type YtApiResponse = {
  items?: YtPlaylistItem[];
  nextPageToken?: string;
  error?: { message: string };
};

function getConfig() {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim() ?? "";
  const playlistId = process.env.PLAYLIST_ID?.trim() ?? "";
  return { apiKey, playlistId };
}

export function isYoutubeConfigured() {
  const { apiKey, playlistId } = getConfig();
  return Boolean(apiKey && playlistId);
}

function mapItems(items: YtPlaylistItem[]): YoutubeVideoItem[] {
  return items
    .filter(
      (item) =>
        item.snippet?.resourceId?.kind === "youtube#video" &&
        item.snippet.resourceId.videoId,
    )
    .map((item) => {
      const snippet = item.snippet;
      const videoId = snippet.resourceId!.videoId;
      const thumbnail =
        snippet.thumbnails?.high?.url ??
        snippet.thumbnails?.medium?.url ??
        snippet.thumbnails?.default?.url ??
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      return {
        videoId,
        title: snippet.title?.trim() || "Sin título",
        description: snippet.description ?? "",
        thumbnail,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        position: snippet.position ?? 0,
      };
    })
    .filter((video) => {
      const title = video.title.toLowerCase();
      return title !== "private video" && title !== "deleted video";
    });
}

async function fetchPlaylistFromYoutube(): Promise<YoutubeVideoItem[]> {
  const { apiKey, playlistId } = getConfig();
  if (!apiKey || !playlistId) {
    throw new Error(
      "Las variables YOUTUBE_API_KEY y/o PLAYLIST_ID no están configuradas.",
    );
  }

  const allVideos: YoutubeVideoItem[] = [];
  let pageToken: string | undefined;

  do {
    const pageTokenParam = pageToken ? `&pageToken=${pageToken}` : "";
    const url =
      `https://www.googleapis.com/youtube/v3/playlistItems` +
      `?part=snippet` +
      `&maxResults=50` +
      `&playlistId=${encodeURIComponent(playlistId)}` +
      `&key=${encodeURIComponent(apiKey)}` +
      pageTokenParam;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        next: { revalidate: CACHE_TTL_SECONDS },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as YtApiResponse | null;
        const msg = errorBody?.error?.message ?? `HTTP ${response.status}`;
        throw new Error(`Error al consultar la YouTube API: ${msg}`);
      }

      const data = (await response.json()) as YtApiResponse;
      allVideos.push(...mapItems(data.items ?? []));
      pageToken = data.nextPageToken;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === "AbortError") {
        throw new Error("La YouTube API tardó demasiado en responder.");
      }
      throw error;
    }
  } while (pageToken);

  return allVideos.sort((a, b) => a.position - b.position);
}

const getCachedPlaylist = unstable_cache(
  async () => fetchPlaylistFromYoutube(),
  ["youtube-playlist-items"],
  {
    revalidate: CACHE_TTL_SECONDS,
    tags: [YOUTUBE_PLAYLIST_CACHE_TAG],
  },
);

export async function getPlaylistVideos(): Promise<YoutubeVideoItem[]> {
  if (!isYoutubeConfigured()) {
    return [];
  }
  return getCachedPlaylist();
}

export async function getPlaylistVideosSafe(): Promise<{
  videos: YoutubeVideoItem[];
  error: string | null;
  configured: boolean;
}> {
  if (!isYoutubeConfigured()) {
    return {
      videos: [],
      error: null,
      configured: false,
    };
  }

  try {
    const videos = await getCachedPlaylist();
    return { videos, error: null, configured: true };
  } catch (error) {
    return {
      videos: [],
      error: error instanceof Error ? error.message : "No se pudieron cargar los videos.",
      configured: true,
    };
  }
}
