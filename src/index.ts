interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * NewsData.io MCP — wraps the NewsData.io global news API (newsdata.io)
 *
 * Tools:
 * - latest_news: latest global news headlines/articles, filterable by query,
 *   country, category, and language
 * - crypto_news: latest cryptocurrency news headlines/articles
 * - news_sources: list available news sources by country/category/language
 *
 * Dual-key model: _apiKey is OPTIONAL. Pass your own NewsData.io key for
 * higher limits, or omit it to use the shared Pipeworx key (injected by the
 * gateway). Key is passed as the `apikey` query param.
 */


const BASE_URL = 'https://newsdata.io/api/1';

const tools: McpToolExport['tools'] = [
  {
    name: 'latest_news',
    description:
      'Get the latest global news headlines and articles. Filter by keyword, country (2-letter, e.g. "us"), category (business, technology, politics, sports, health, science), and language. Returns article title, description, link, source, publish date, category, and country. Paginate via the nextPage token. Example: latest_news({ query: "election", country: "us", category: "politics" })',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Keyword or phrase to search news articles for, e.g. "election", "AI chips"',
        },
        country: {
          type: 'string',
          description: '2-letter country code to filter news by, e.g. "us", "gb", "in"',
        },
        category: {
          type: 'string',
          description: 'News category, e.g. "business", "technology", "politics", "sports", "health", "science"',
        },
        language: {
          type: 'string',
          description: 'Language code to filter news by, e.g. "en", "es", "fr"',
        },
        page: {
          type: 'string',
          description: 'nextPage token returned from a prior call, to fetch the next page of results',
        },
        _apiKey: {
          type: 'string',
          description: 'Optional — your own NewsData.io API key for higher limits; omit to use the shared Pipeworx key.',
        },
      },
    },
  },
  {
    name: 'crypto_news',
    description:
      'Get the latest cryptocurrency news headlines and articles. Filter by keyword, coin ticker(s) (e.g. "btc,eth"), and language. Returns article title, description, link, source, publish date, category, and country. Example: crypto_news({ coin: "btc,eth", query: "etf" })',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Keyword or phrase to search crypto news for, e.g. "etf", "halving"',
        },
        coin: {
          type: 'string',
          description: 'Comma-separated coin ticker(s) to filter by, e.g. "btc,eth"',
        },
        language: {
          type: 'string',
          description: 'Language code to filter news by, e.g. "en", "es", "fr"',
        },
        _apiKey: {
          type: 'string',
          description: 'Optional — your own NewsData.io API key for higher limits; omit to use the shared Pipeworx key.',
        },
      },
    },
  },
  {
    name: 'news_sources',
    description:
      'List available global news sources. Filter by country (2-letter), category, and language. Returns source id, name, url, category, country, and language — useful for discovering which outlets cover a given region or topic. Example: news_sources({ country: "us", category: "technology" })',
    inputSchema: {
      type: 'object' as const,
      properties: {
        country: {
          type: 'string',
          description: '2-letter country code to filter sources by, e.g. "us", "gb"',
        },
        category: {
          type: 'string',
          description: 'News category to filter sources by, e.g. "business", "technology"',
        },
        language: {
          type: 'string',
          description: 'Language code to filter sources by, e.g. "en", "es"',
        },
        _apiKey: {
          type: 'string',
          description: 'Optional — your own NewsData.io API key for higher limits; omit to use the shared Pipeworx key.',
        },
      },
    },
  },
];

interface NewsArticle {
  title?: string;
  description?: string;
  link?: string;
  source_id?: string;
  pubDate?: string;
  category?: string[] | string;
  country?: string[] | string;
}

interface NewsListResponse {
  status?: string;
  totalResults?: number;
  results?: NewsArticle[];
  nextPage?: string;
}

interface NewsSource {
  id?: string;
  name?: string;
  url?: string;
  category?: string[] | string;
  country?: string[] | string;
  language?: string[] | string;
}

interface SourcesResponse {
  results?: NewsSource[];
}

async function newsdataGet(apiKey: string, path: string, params: URLSearchParams): Promise<unknown> {
  params.set('apikey', apiKey);
  const res = await fetch(`${BASE_URL}${path}?${params}`);
  if (!res.ok) {
    const text = await res.text();
    return { error: res.status, message: text };
  }
  return res.json();
}

function mapArticles(data: NewsListResponse) {
  const results = data.results ?? [];
  return {
    totalResults: data.totalResults,
    nextPage: data.nextPage,
    articles: results.map((a) => ({
      title: a.title,
      description: a.description,
      link: a.link,
      source: a.source_id,
      pubDate: a.pubDate,
      category: a.category,
      country: a.country,
    })),
  };
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = args._apiKey as string;
  delete args._apiKey;

  if (!apiKey) {
    return { error: 'api_key_required', message: 'No NewsData.io key available.' };
  }

  switch (name) {
    case 'latest_news': {
      const params = new URLSearchParams();
      if (args.query) params.set('q', args.query as string);
      if (args.country) params.set('country', args.country as string);
      if (args.category) params.set('category', args.category as string);
      if (args.language) params.set('language', args.language as string);
      if (args.page) params.set('page', args.page as string);
      const data = await newsdataGet(apiKey, '/latest', params);
      if (data && typeof data === 'object' && 'error' in (data as object)) return data;
      return mapArticles(data as NewsListResponse);
    }
    case 'crypto_news': {
      const params = new URLSearchParams();
      if (args.query) params.set('q', args.query as string);
      if (args.coin) params.set('coin', args.coin as string);
      if (args.language) params.set('language', args.language as string);
      const data = await newsdataGet(apiKey, '/crypto', params);
      if (data && typeof data === 'object' && 'error' in (data as object)) return data;
      return mapArticles(data as NewsListResponse);
    }
    case 'news_sources': {
      const params = new URLSearchParams();
      if (args.country) params.set('country', args.country as string);
      if (args.category) params.set('category', args.category as string);
      if (args.language) params.set('language', args.language as string);
      const data = await newsdataGet(apiKey, '/sources', params);
      if (data && typeof data === 'object' && 'error' in (data as object)) return data;
      const sources = (data as SourcesResponse).results ?? [];
      return sources.map((s) => ({
        id: s.id,
        name: s.name,
        url: s.url,
        category: s.category,
        country: s.country,
        language: s.language,
      }));
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
