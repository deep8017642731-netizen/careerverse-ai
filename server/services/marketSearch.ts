export interface MarketSearchResult {
  title: string;
  url: string;
  content: string;
}

interface TavilyResponse {
  results?: Array<{ title?: string; url?: string; content?: string }>;
}

export async function searchCurrentMarket(query: string): Promise<MarketSearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'advanced',
      topic: 'news',
      max_results: 5,
      include_answer: false,
      include_raw_content: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Market search failed (${response.status})`);
  }

  const data = await response.json() as TavilyResponse;
  return (data.results || []).flatMap(result => {
    if (!result.title || !result.url || !result.content) return [];
    return [{ title: result.title, url: result.url, content: result.content }];
  });
}
