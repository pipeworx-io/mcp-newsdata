# mcp-newsdata

NewsData.io MCP — wraps the NewsData.io global news API (newsdata.io)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/newsdata/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Newsdata data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/newsdata_latest_news \
  -H 'Content-Type: application/json' \
  -d '{"query":"stock market","category":"business"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/newsdata_latest_news`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.
