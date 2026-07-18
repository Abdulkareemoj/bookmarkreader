export interface HtmlBookmarkEntry {
	title: string;
	url: string;
	addDate?: string;
	tags?: string[];
	description?: string;
	icon?: string;
}

const BOOKMARK_REGEX =
	/<A\s+[^>]*HREF\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/A\s*>/gi;
const TAG_REGEX = /TAGS\s*=\s*["']([^"']*)["']/i;
const ADD_DATE_REGEX = /ADD_DATE\s*=\s*["']([^"']*)["']/i;
const ICON_REGEX = /ICON\s*=\s*["']([^"']*)["']/i;
const DESCRIPTION_REGEX =
	/<DD>([\s\S]*?)<\/?DL/i;

function parseAddDate(value: string): string | undefined {
	if (!value) return undefined;
	const ts = parseInt(value, 10);
	if (!isNaN(ts)) return new Date(ts * 1000).toISOString();
	return value;
}

export function parseHtmlBookmarks(html: string): HtmlBookmarkEntry[] {
	const entries: HtmlBookmarkEntry[] = [];
	let match: RegExpExecArray | null;
	const bookmarkMatches: { index: number; match: RegExpExecArray }[] = [];

	while ((match = BOOKMARK_REGEX.exec(html)) !== null) {
		bookmarkMatches.push({ index: match.index, match });
	}

	for (const { match: m } of bookmarkMatches) {
		const href = m[1].trim();
		if (!href || href.startsWith("place:")) continue;

		const rawTitle = m[2]?.trim() || "Untitled";
		const title = rawTitle.replace(/<[^>]*>/g, "").trim();

		const fullTag = m[0];
		const tagsMatch = fullTag.match(TAG_REGEX);
		const tags = tagsMatch
			? tagsMatch[1]
					.split(",")
					.map((t) => t.trim())
					.filter(Boolean)
			: undefined;

		const addDateMatch = fullTag.match(ADD_DATE_REGEX);
		const iconMatch = fullTag.match(ICON_REGEX);

		const entry: HtmlBookmarkEntry = {
			title,
			url: href,
			addDate: addDateMatch ? parseAddDate(addDateMatch[1]) : undefined,
			tags,
			icon: iconMatch ? iconMatch[1] : undefined,
		};

		entries.push(entry);
	}

	// Try to match descriptions ( <DD>text after an <A> tag )
	for (let i = 0; i < entries.length; i++) {
		const entryIndex = bookmarkMatches[i]?.index ?? -1;
		if (entryIndex < 0) continue;
		const afterBookmark = html.slice(entryIndex + bookmarkMatches[i].match[0].length);
		const descMatch = afterBookmark.match(DESCRIPTION_REGEX);
		if (descMatch) {
			entries[i].description = descMatch[1].replace(/<[^>]*>/g, "").trim();
		}
	}

	return entries;
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

export function generateHtmlBookmarks(options: {
	title?: string;
	bookmarks: {
		title: string;
		url: string;
		addDate?: string;
		tags?: string[];
		description?: string;
		icon?: string;
	}[];
}): string {
	const now = Math.floor(Date.now() / 1000);

	const items = options.bookmarks
		.map((b) => {
			const attrs: string[] = [`HREF="${escapeHtml(b.url)}"`];
			attrs.push(`ADD_DATE="${now}"`);
			if (b.tags && b.tags.length > 0)
				attrs.push(`TAGS="${b.tags.map(escapeHtml).join(",")}"`);
			if (b.icon) attrs.push(`ICON="${escapeHtml(b.icon)}"`);
			const parts = [`    <DT><A ${attrs.join(" ")}>${escapeHtml(b.title)}</A>`];
			if (b.description)
				parts.push(`    <DD>${escapeHtml(b.description)}`);
			return parts.join("\n");
		})
		.join("\n");

	return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file by ReadrSync. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>${escapeHtml(options.title || "ReadrSync Bookmarks")}</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${items}
</DL><p>`;
}
