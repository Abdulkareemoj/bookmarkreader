export interface YouTubeChannelResult {
  feedUrl: string;
  title: string;
}

function normalizeYouTubeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Already a full URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // Ensure it's a youtube.com domain
    try {
      const url = new URL(trimmed);
      if (
        url.hostname === "youtube.com" ||
        url.hostname === "www.youtube.com" ||
        url.hostname === "m.youtube.com" ||
        url.hostname === "youtu.be"
      ) {
        return trimmed;
      }
    } catch {
      return null;
    }
    return null;
  }

  // Bare @handle or channel ID
  if (trimmed.startsWith("@") || trimmed.startsWith("UC")) {
    return `https://www.youtube.com/${trimmed}`;
  }

  // Try as a youtube URL without protocol
  if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
    return `https://${trimmed}`;
  }

  return null;
}

export function parseYouTubeChannelUrl(input: string): {
  normalizedUrl: string | null;
  isValid: boolean;
} {
  const normalized = normalizeYouTubeUrl(input);
  return {
    normalizedUrl: normalized,
    isValid: normalized !== null,
  };
}

export async function discoverYouTubeChannelFeed(
  channelUrl: string,
  fetchHtml: (url: string) => Promise<string>,
): Promise<YouTubeChannelResult | null> {
  try {
    const normalized = normalizeYouTubeUrl(channelUrl);
    if (!normalized) return null;

    const html = await fetchHtml(normalized);

    // Extract RSS feed URL from <link> tag with type application/rss+xml
    const rssMatch = html.match(
      /<link[^>]+type=["']application\/rss\+xml["'][^>]*href=["']([^"']+)["']/i,
    );
    if (!rssMatch) return null;

    let feedUrl = rssMatch[1];

    // Handle relative URLs
    if (feedUrl.startsWith("//")) {
      feedUrl = "https:" + feedUrl;
    } else if (feedUrl.startsWith("/")) {
      const url = new URL(normalized);
      feedUrl = url.protocol + "//" + url.host + feedUrl;
    }

    // Extract channel title from <title> tag (YouTube format: "Channel Name - YouTube")
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch
      ? titleMatch[1].replace(/ - YouTube$/, "").trim()
      : "YouTube Channel";

    return { feedUrl, title };
  } catch (e) {
    console.warn("[youtube] Failed to discover feed:", e);
    return null;
  }
}
