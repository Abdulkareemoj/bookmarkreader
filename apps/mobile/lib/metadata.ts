export interface BookmarkMetadata {
	title?: string;
	description?: string;
	image?: string;
	favicon?: string;
}

export async function fetchBookmarkMetadata(
	url: string,
): Promise<BookmarkMetadata> {
	try {
		const res = await fetch(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
				Accept: "text/html,application/xhtml+xml",
			},
		});

		if (!res.ok) return {};

		const html = await res.text();

		const getMeta = (property: string): string | undefined => {
			const patterns = [
				new RegExp(
					`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`,
					"i",
				),
				new RegExp(
					`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`,
					"i",
				),
				new RegExp(
					`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`,
					"i",
				),
				new RegExp(
					`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`,
					"i",
				),
			];

			for (const pattern of patterns) {
				const match = html.match(pattern);
				if (match) return match[1];
			}
			return undefined;
		};

		const title =
			getMeta("og:title") ||
			getMeta("twitter:title") ||
			html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();

		const description =
			getMeta("og:description") ||
			getMeta("twitter:description") ||
			getMeta("description");

		const image = getMeta("og:image") || getMeta("twitter:image");

		const favicon =
			html.match(
				/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i,
			)?.[1] ||
			html.match(
				/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i,
			)?.[1];

		const resolvedFavicon = favicon
			? favicon.startsWith("http")
				? favicon
				: new URL(favicon, url).href
			: `${new URL(url).origin}/favicon.ico`;

		const resolvedImage = image
			? image.startsWith("http")
				? image
				: new URL(image, url).href
			: undefined;

		return {
			title: title || undefined,
			description: description || undefined,
			image: resolvedImage,
			favicon: resolvedFavicon,
		};
	} catch {
		return {};
	}
}
