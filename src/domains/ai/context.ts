import type { CivicContextSummary } from "@/domains/ai/types";

type CacheEntry = {
  expiresAt: number;
  value: CivicContextSummary;
};

let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000;

const EMPTY_CONTEXT: CivicContextSummary = {
  available: false,
  score: null,
  summary: "Insufficient data.",
  sourceTitle: null,
  sourceDate: null,
  sourceDomain: null,
  relevance: null,
  checkedAt: null,
};

async function fetchOptionalRssContext(): Promise<CivicContextSummary> {
  const feedUrl = process.env.CIVIC_CONTEXT_RSS_URL?.trim();
  if (!feedUrl) {
    return EMPTY_CONTEXT;
  }

  try {
    const response = await fetch(feedUrl, {
      signal: AbortSignal.timeout(5_000),
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!response.ok) {
      return EMPTY_CONTEXT;
    }

    const xml = await response.text();
    const titleMatch = xml.match(/<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>/i)
      ?? xml.match(/<item>[\s\S]*?<title>(.*?)<\/title>/i);
    const dateMatch = xml.match(/<item>[\s\S]*?<pubDate>(.*?)<\/pubDate>/i);
    const title = titleMatch?.[1]?.trim() ?? null;
    const pubDate = dateMatch?.[1]?.trim() ?? null;

    if (!title) {
      return EMPTY_CONTEXT;
    }

    let domain: string | null = null;
    try {
      domain = new URL(feedUrl).hostname;
    } catch {
      domain = null;
    }

    return {
      available: true,
      score: 35,
      summary: `Recent civic context headline: ${title}`,
      sourceTitle: title,
      sourceDate: pubDate,
      sourceDomain: domain,
      relevance: 35,
      checkedAt: new Date().toISOString(),
    };
  } catch {
    return EMPTY_CONTEXT;
  }
}

export async function getCivicContextSummary(): Promise<CivicContextSummary> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return cache.value;
  }

  const value = await fetchOptionalRssContext();
  cache = { value, expiresAt: now + CACHE_TTL_MS };
  return value;
}
