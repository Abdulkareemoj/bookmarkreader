// Mobile RSS fetching + parsing — uses fast-xml-parser only, no extractus

import { XMLParser } from "fast-xml-parser";
import type { ParsedArticle } from "@packages/agents";

// Network

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const CORS_PROXIES = [
  "https://corsproxy.io/?",
  "https://api.allorigins.win/raw?url=",
];

export async function fetchFeed(url: string): Promise<string> {
  // On mobile, fetch directly first (no CORS restriction in RN)
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/rss+xml, application/atom+xml, application/json, application/xml, text/xml;q=0.9, */*;q=0.8",
        "User-Agent": BROWSER_UA,
      },
    });
    if (res.ok) return await res.text();
  } catch {
    // fall through to proxies
  }

  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetch(proxy + encodeURIComponent(url));
      if (res.ok) return await res.text();
    } catch {
      // try next proxy
    }
  }

  throw new Error(`Failed to fetch feed: ${url}`);
}

// Parser

export function parseFeedXml(xmlText: string, feedId: string): ParsedArticle[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    parseAttributeValue: false,
    trimValues: true,
    cdataPropName: "__cdata",
  });

  let result: any;
  try {
    result = parser.parse(xmlText);
  } catch (e) {
    console.warn("[parseFeedXml] XML parse error:", e);
    return [];
  }

  const timestamp = new Date().toISOString();
  const out: ParsedArticle[] = [];

  const normalize = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") {
      if (val.__cdata) return String(val.__cdata);
      if (val["#text"]) return String(val["#text"]);
    }
    return String(val);
  };

  const extractImage = (content: string, item: any): string | undefined => {
    // Check enclosure
    const enc = item.enclosure;
    if (enc) {
      const encUrl = enc["@_url"] || enc.url;
      if (encUrl && String(encUrl).startsWith("http")) return String(encUrl);
    }
    // Check media:content / media:thumbnail (top-level or inside media:group)
    const mediaGroup = item["media:group"];
    const mediaContent = item["media:content"] ?? mediaGroup?.["media:content"];
    const mediaThumbnail = item["media:thumbnail"] ?? mediaGroup?.["media:thumbnail"];
    const mediaUrl =
      mediaContent?.["@_url"] ||
      mediaThumbnail?.["@_url"];
    if (mediaUrl) return String(mediaUrl);
    // Extract from HTML content
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    return imgMatch?.[1];
  };

  // RSS 2.0
  const rssItems = result?.rss?.channel?.item;
  if (rssItems) {
    const items = Array.isArray(rssItems) ? rssItems : [rssItems];
    for (const item of items) {
      const link = normalize(item.link) || normalize(item.guid) || normalize(item["guid"]);
      if (!link) continue;

      const content =
        normalize(item["content:encoded"]) ||
        normalize(item.description) ||
        "";

      const pubDateRaw = normalize(item.pubDate) || normalize(item["dc:date"]);
      const pubDate = pubDateRaw
        ? (() => { try { return new Date(pubDateRaw).toISOString(); } catch { return timestamp; } })()
        : timestamp;

      out.push({
        feedId,
        title: normalize(item.title) || "(untitled)",
        link,
        content,
        contentSnippet: content.replace(/<[^>]*>/g, "").slice(0, 500) || undefined,
        imageUrl: extractImage(content, item),
        pubDate,
        read: false,
        liked: false,
        saved: false,
        lastUpdatedAt: timestamp,
      });
    }
    return out;
  }

  //  Atom
  const atomEntries = result?.feed?.entry;
  if (atomEntries) {
    const entries = Array.isArray(atomEntries) ? atomEntries : [atomEntries];
    for (const entry of entries) {
      // Atom links can be a string, object, or array
      let link = "";
      const linkVal = entry.link;
      if (typeof linkVal === "string") {
        link = linkVal;
      } else if (Array.isArray(linkVal)) {
        const alt = linkVal.find((l: any) => !l["@_rel"] || l["@_rel"] === "alternate");
        link = alt?.["@_href"] || linkVal[0]?.["@_href"] || "";
      } else if (linkVal) {
        link = linkVal["@_href"] || normalize(linkVal) || "";
      }
      if (!link) continue;

      const content =
        normalize(entry.content) ||
        normalize(entry.summary) ||
        normalize(entry["media:group"]?.["media:description"]) ||
        "";

      // Fallback: yt:videoId → construct watch URL
      if (!link && entry["yt:videoId"]) {
        link = `https://www.youtube.com/watch?v=${entry["yt:videoId"]}`;
      }

      const pubDateRaw =
        normalize(entry.published) ||
        normalize(entry.updated) ||
        "";
      const pubDate = pubDateRaw
        ? (() => { try { return new Date(pubDateRaw).toISOString(); } catch { return timestamp; } })()
        : timestamp;

      out.push({
        feedId,
        title: normalize(entry.title) || "(untitled)",
        link,
        content,
        contentSnippet: content.replace(/<[^>]*>/g, "").slice(0, 500) || undefined,
        imageUrl: extractImage(content, entry),
        pubDate,
        read: false,
        liked: false,
        saved: false,
        lastUpdatedAt: timestamp,
      });
    }
  }

  return out;
}

// Extract feed-level title from raw XML
export function parseFeedTitle(xmlText: string): string | null {
  const match = xmlText.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
  return match?.[1]?.trim() ?? null;
}

// Article content extraction (mobile-safe, no extractus)
export async function extractArticleContent(
  url: string,
): Promise<{ content: string; image?: string } | null> {
  try {
    const html = await fetchFeed(url); // reuse same fetch logic

    const clean = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<aside[\s\S]*?<\/aside>/gi, "");

    // Try to find main content block
    const articleMatch =
      clean.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
      clean.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
      clean.match(/<div[^>]*class=["'][^"']*(?:article|post|content|entry|story)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);

    const content = articleMatch ? articleMatch[1] : clean;

    // OG image
    const image =
      html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)?.[1];

    return { content, image };
  } catch (err) {
    console.warn("[extractArticleContent mobile] Failed:", url, err);
    return null;
  }
}