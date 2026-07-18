import { XMLParser, XMLBuilder } from "fast-xml-parser";

export interface OpmlOutline {
	text?: string;
	title?: string;
	type?: string;
	xmlUrl?: string;
	htmlUrl?: string;
	url?: string;
	description?: string;
	category?: string;
	/** Nested outlines (for folders) */
	outline?: OpmlOutline | OpmlOutline[];
}

export interface OpmlDocument {
	title?: string;
	dateCreated?: string;
	dateModified?: string;
	outlines: OpmlOutline[];
}

export function parseOpml(xml: string): OpmlDocument {
	const parser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
		textNodeName: "#text",
	});
	const result = parser.parse(xml);

	const body = result?.opml?.body;
	if (!body) return { outlines: [] };

	const rawOutlines = body.outline;
	const outlines = rawOutlines
		? Array.isArray(rawOutlines)
			? rawOutlines
			: [rawOutlines]
		: [];

	return {
		title: result.opml?.head?.title,
		dateCreated: result.opml?.head?.dateCreated,
		dateModified: result.opml?.head?.dateModified,
		outlines: normalizeOutlines(outlines),
	};
}

function normalizeOutlines(
	items: any[],
): OpmlOutline[] {
	const result: OpmlOutline[] = [];
	for (const item of items) {
		const outline: OpmlOutline = {
			text: item["@_text"],
			title: item["@_title"] ?? item["@_text"],
			type: item["@_type"],
			xmlUrl: item["@_xmlUrl"],
			htmlUrl: item["@_htmlUrl"],
			url: item["@_url"] ?? item["@_href"],
			description: item["@_description"],
		};
		if (item.outline) {
			outline.outline = Array.isArray(item.outline)
				? normalizeOutlines(item.outline)
				: normalizeOutlines([item.outline])[0];
		}
		result.push(outline);
	}
	return result;
}

function flattenOutlines(
	outlines: OpmlOutline[],
): { feeds: OpmlOutline[]; bookmarks: OpmlOutline[] } {
	const feeds: OpmlOutline[] = [];
	const bookmarks: OpmlOutline[] = [];
	for (const o of outlines) {
		if (o.outline) {
			if (Array.isArray(o.outline)) {
				const nested = flattenOutlines(o.outline as OpmlOutline[]);
				feeds.push(...nested.feeds);
				bookmarks.push(...nested.bookmarks);
			} else {
				const nested = flattenOutlines([o.outline as OpmlOutline]);
				feeds.push(...nested.feeds);
				bookmarks.push(...nested.bookmarks);
			}
		} else if (o.xmlUrl) {
			feeds.push(o);
		} else if (o.url) {
			bookmarks.push(o);
		}
	}
	return { feeds, bookmarks };
}

export function extractFeedsFromOpml(
	opml: OpmlDocument,
): { title: string; feedUrl: string; siteUrl?: string }[] {
	const { feeds } = flattenOutlines(opml.outlines);
	return feeds.map((f) => ({
		title: f.title || f.text || f.xmlUrl || "Untitled Feed",
		feedUrl: f.xmlUrl || "",
		siteUrl: f.htmlUrl,
	}));
}

export function extractBookmarksFromOpml(
	opml: OpmlDocument,
): { title: string; url: string; description?: string; tags?: string[] }[] {
	const { bookmarks } = flattenOutlines(opml.outlines);
	return bookmarks.map((b) => ({
		title: b.title || b.text || b.url || "Untitled",
		url: b.url || "",
		description: b.description,
		tags: b.category ? b.category.split(",").map((t) => t.trim()) : undefined,
	}));
}

function outlineToXml(o: OpmlOutline, indent: string): string {
	const attrs: string[] = [];
	if (o.text !== undefined) attrs.push(`text="${escapeXml(o.text)}"`);
	if (o.title !== undefined) attrs.push(`title="${escapeXml(o.title)}"`);
	if (o.type !== undefined) attrs.push(`type="${escapeXml(o.type)}"`);
	if (o.xmlUrl !== undefined) attrs.push(`xmlUrl="${escapeXml(o.xmlUrl)}"`);
	if (o.htmlUrl !== undefined) attrs.push(`htmlUrl="${escapeXml(o.htmlUrl)}"`);
	if (o.url !== undefined) attrs.push(`url="${escapeXml(o.url)}"`);
	if (o.description !== undefined)
		attrs.push(`description="${escapeXml(o.description)}"`);

	if (o.outline) {
		const children = Array.isArray(o.outline) ? o.outline : [o.outline];
		const inner = children.map((c) => outlineToXml(c, indent + "  ")).join("\n");
		return `${indent}<outline ${attrs.join(" ")}>\n${inner}\n${indent}</outline>`;
	}
	return `${indent}<outline ${attrs.join(" ")}/>`;
}

function escapeXml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

export function generateOpml(options: {
	title?: string;
	feeds?: { title: string; feedUrl: string; siteUrl?: string }[];
	bookmarks?: { title: string; url: string; description?: string }[];
}): string {
	const outlines: OpmlOutline[] = [];

	if (options.feeds && options.feeds.length > 0) {
		const feedOutlines: OpmlOutline[] = options.feeds.map((f) => ({
			text: f.title,
			type: "rss",
			xmlUrl: f.feedUrl,
			htmlUrl: f.siteUrl,
		}));
		outlines.push({ text: "Feeds", outline: feedOutlines });
	}

	if (options.bookmarks && options.bookmarks.length > 0) {
		const bookmarkOutlines: OpmlOutline[] = options.bookmarks.map((b) => ({
			text: b.title,
			type: "link",
			url: b.url,
			description: b.description,
		}));
		outlines.push({ text: "Bookmarks", outline: bookmarkOutlines });
	}

	const bodyXml = outlines.map((o) => outlineToXml(o, "    ")).join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>${escapeXml(options.title || "ReadrSync Export")}</title>
    <dateCreated>${new Date().toISOString()}</dateCreated>
  </head>
  <body>
${bodyXml}
  </body>
</opml>`;
}
