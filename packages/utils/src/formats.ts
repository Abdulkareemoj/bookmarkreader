export type ExportFormat = "json" | "opml" | "html";
export type DetectedFormat = ExportFormat | "unknown";

export function detectFormat(content: string): DetectedFormat {
	const trimmed = content.trim();
	if (trimmed.startsWith("{")) return "json";
	if (trimmed.toLowerCase().includes("<opml")) return "opml";
	if (
		trimmed.includes("<!DOCTYPE NETSCAPE-Bookmark") ||
		trimmed.includes("<DL") ||
		(trimmed.includes("<A ") && trimmed.includes("HREF="))
	)
		return "html";
	return "unknown";
}
