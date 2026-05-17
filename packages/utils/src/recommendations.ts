const STOPWORDS = new Set([
	"a",
	"an",
	"the",
	"and",
	"or",
	"but",
	"in",
	"on",
	"at",
	"to",
	"for",
	"of",
	"with",
	"by",
	"from",
	"up",
	"about",
	"into",
	"through",
	"is",
	"it",
	"its",
	"this",
	"that",
	"was",
	"are",
	"be",
	"been",
	"being",
	"have",
	"has",
	"had",
	"do",
	"does",
	"did",
	"will",
	"would",
	"could",
	"should",
	"may",
	"might",
	"can",
	"not",
	"no",
	"nor",
	"so",
	"yet",
	"both",
	"either",
	"neither",
	"just",
	"than",
	"then",
	"when",
	"where",
	"how",
	"what",
	"which",
	"who",
	"whom",
	"s",
	"re",
	"ve",
	"ll",
	"d",
	"t",
	"as",
	"if",
]);

export function extractKeywords(text: string, topN = 10): string[] {
	const words = text
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, " ")
		.split(/\s+/)
		.filter((w) => w.length > 3 && !STOPWORDS.has(w));

	const freq = new Map<string, number>();
	for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);

	return [...freq.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, topN)
		.map(([w]) => w);
}

export interface ScoredArticle {
	id: string;
	score: number;
	matchedKeywords: string[];
}

/**
 * Given a set of "seed" articles (e.g. recently liked),
 * score all candidate articles by keyword overlap with the seeds.
 */
export function scoreArticlesByKeywords(
	seeds: Array<{
		id: string;
		title?: string | null;
		contentSnippet?: string | null;
	}>,
	candidates: Array<{
		id: string;
		title?: string | null;
		contentSnippet?: string | null;
	}>,
	excludeIds: Set<string> = new Set(),
): ScoredArticle[] {
	if (seeds.length === 0) return [];

	// Build a weighted keyword set from seeds
	const seedKeywordFreq = new Map<string, number>();
	for (const seed of seeds) {
		const text = `${seed.title ?? ""} ${seed.contentSnippet ?? ""}`;
		const keywords = extractKeywords(text, 15);
		for (const kw of keywords) {
			seedKeywordFreq.set(kw, (seedKeywordFreq.get(kw) ?? 0) + 1);
		}
	}

	const results: ScoredArticle[] = [];

	for (const candidate of candidates) {
		if (excludeIds.has(candidate.id)) continue;

		const text = `${candidate.title ?? ""} ${candidate.contentSnippet ?? ""}`;
		const candidateKeywords = new Set(extractKeywords(text, 20));

		let score = 0;
		const matched: string[] = [];

		for (const [kw, freq] of seedKeywordFreq.entries()) {
			if (candidateKeywords.has(kw)) {
				score += freq; // weight by how often it appeared in seeds
				matched.push(kw);
			}
		}

		if (score > 0) {
			results.push({ id: candidate.id, score, matchedKeywords: matched });
		}
	}

	return results.sort((a, b) => b.score - a.score);
}
