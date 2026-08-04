# mcp-newsdata

NewsData.io MCP — wraps the NewsData.io global news API (newsdata.io)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `latest_news` | Get the latest global news headlines and articles — world news, breaking news, and business/financial/stock-market news. Filter by keyword, country (2-letter, e.g. "us"), category (business, technology, politics, sports, health, science), and language. IMPORTANT: for stock-market / financial-market / economy / "world market news" questions, ALWAYS pass category: "business" — it returns real market-news outlets and filters out low-quality SEO/crypto-promo articles. Returns article title, description, link, source, publish date, category, and country. Paginate via the nextPage token. Examples: latest_news({ query: "stock market", category: "business" }) for world market news; latest_news({ query: "election", country: "us", category: "politics" }). |
| `crypto_news` | Get the latest cryptocurrency news headlines and articles. Filter by keyword, coin ticker(s) (e.g. "btc,eth"), and language. Returns article title, description, link, source, publish date, category, and country. Example: crypto_news({ coin: "btc,eth", query: "etf" }) |
| `news_sources` | List available global news sources. Filter by country (2-letter), category, and language. Returns source id, name, url, category, country, and language — useful for discovering which outlets cover a given region or topic. Example: news_sources({ country: "us", category: "technology" }) |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "newsdata": {
      "url": "https://gateway.pipeworx.io/newsdata/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Newsdata data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
