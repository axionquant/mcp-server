# Axion MCP Server

A Model Context Protocol (MCP) server that gives LLMs access to the [Axion](https://axionquant.com) financial data API - covering stocks, crypto, forex, futures, indices, ETFs, economics, news, sentiment, filings, financials, and more.

## Installation

```bash
npm i @axionquant/mcp
```

## Configuration

[Get your free API key](https://axionquant.com/dashboard/api-keys)

### Claude Desktop

Add the following to your Claude Desktop config file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "axion-financial-data": {
      "command": "node",
      "args": ["/absolute/path/to/node_modules/@axionquant/mcp/index.js"],
      "env": {
        "API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Other MCP Clients

The server uses stdio transport and is compatible with any MCP client. Set the `API_KEY` environment variable and configure according to your client's documentation.

## Available Tools

### Stocks
| Tool | Description |
|------|-------------|
| `stocks_tickers` | List stock tickers, optionally filtered by country or exchange |
| `stocks_quote` | Get current quote/details for a stock ticker |
| `stocks_prices` | Get historical price data (supports `from`, `to`, `frame`) |

### Crypto
| Tool | Description |
|------|-------------|
| `crypto_tickers` | List cryptocurrency tickers, optionally filtered by type |
| `crypto_quote` | Get current details for a cryptocurrency |
| `crypto_prices` | Get historical price data |

### Forex
| Tool | Description |
|------|-------------|
| `forex_tickers` | List forex pairs, optionally filtered by country or exchange |
| `forex_quote` | Get current details for a forex pair |
| `forex_prices` | Get historical price data |

### Futures
| Tool | Description |
|------|-------------|
| `futures_tickers` | List futures tickers, optionally filtered by exchange |
| `futures_quote` | Get current details for a futures contract |
| `futures_prices` | Get historical price data |

### Indices
| Tool | Description |
|------|-------------|
| `indices_tickers` | List index tickers, optionally filtered by exchange |
| `indices_quote` | Get current details for an index |
| `indices_prices` | Get historical price data |

### ETFs
| Tool | Description |
|------|-------------|
| `etf_fund` | Get ETF fund information including ratings and metrics |
| `etf_holdings` | Get top holdings with weights, shares, and market value |
| `etf_holdings_all` | Get all ETF holdings with weights and last updated date |
| `etf_exposure` | Find which ETFs hold a specific stock ticker |

### Economics (FRED)
| Tool | Description |
|------|-------------|
| `econ_search` | Search for economic datasets |
| `econ_dataset` | Get a time series by dataset ID |
| `econ_calendar` | Get economic calendar events (filterable by country, currency, category, importance) |

### News
| Tool | Description |
|------|-------------|
| `news_general` | Get general market news headlines |
| `news_ticker` | Get news for a specific company |
| `news_country` | Get news for a specific country |
| `news_category` | Get news by category (e.g. `business`, `technology`) |

### Sentiment
| Tool | Description |
|------|-------------|
| `sentiment_all` | Get combined sentiment (social + news + analyst) for a ticker |
| `sentiment_social` | Get social media sentiment |
| `sentiment_news` | Get news sentiment |
| `sentiment_analyst` | Get analyst/AI sentiment |

### Profiles
| Tool | Description |
|------|-------------|
| `profiles_profile` | Get full asset profile |
| `profiles_recommendation` | Get analyst recommendation trend |
| `profiles_statistics` | Get key statistics |
| `profiles_summary` | Get summary detail |
| `profiles_calendar` | Get earnings and dividend calendar events |
| `profiles_info` | Get company info / summary profile |

### Earnings
| Tool | Description |
|------|-------------|
| `earnings_history` | Get historical earnings |
| `earnings_trend` | Get earnings trend |
| `earnings_index` | Get index trend |
| `earnings_report` | Get earnings report for a specific year and quarter |

### SEC Filings
| Tool | Description |
|------|-------------|
| `filings_recent` | Get recent filings, optionally filtered by form type |
| `filings_forms` | Get filings by form type (e.g. `10-K`, `8-K`) |
| `filings_desc_forms` | List all available SEC form types |
| `filings_search` | Search filings by year/quarter |

### Financials
| Tool | Description |
|------|-------------|
| `financials_revenue` | Historical revenue |
| `financials_net_income` | Historical net income |
| `financials_total_assets` | Historical total assets |
| `financials_total_liabilities` | Historical total liabilities |
| `financials_stockholders_equity` | Historical stockholders equity |
| `financials_current_assets` | Historical current assets |
| `financials_current_liabilities` | Historical current liabilities |
| `financials_operating_cash_flow` | Historical operating cash flow |
| `financials_capital_expenditures` | Historical capital expenditures |
| `financials_free_cash_flow` | Historical free cash flow |
| `financials_shares_outstanding_basic` | Historical basic shares outstanding |
| `financials_shares_outstanding_diluted` | Historical diluted shares outstanding |
| `financials_metrics` | Calculated financial metrics |
| `financials_snapshot` | Snapshot of key financial data |

### Insiders & Ownership
| Tool | Description |
|------|-------------|
| `insiders_funds` | Fund ownership data |
| `insiders_individuals` | Insider holders (individuals) |
| `insiders_institutions` | Institutional ownership |
| `insiders_ownership` | Major holders breakdown |
| `insiders_activity` | Net share purchase activity |
| `insiders_transactions` | Insider transactions |

### ESG
| Tool | Description |
|------|-------------|
| `esg_data` | Get ESG (Environmental, Social, Governance) scores for a ticker |

### Supply Chain
| Tool | Description |
|------|-------------|
| `supply_chain_customers` | Get a company's customers |
| `supply_chain_peers` | Get peer companies / competitors |
| `supply_chain_suppliers` | Get a company's suppliers |

### Credit
| Tool | Description |
|------|-------------|
| `credit_search` | Search the S&P credit rating database by organization name |
| `credit_ratings` | Get credit ratings for a specific organization by ID |

### Web Traffic
| Tool | Description |
|------|-------------|
| `webtraffic_traffic` | Get website traffic data for a company |

## Example Queries

Once connected to an LLM like Claude, you can ask natural language questions such as:

- "What are the NASDAQ-listed stock tickers?"
- "Get Bitcoin's price history for the last 30 days"
- "What are SPY's top 10 holdings?"
- "Show me Apple's credit rating"
- "What's Tesla's ESG score?"
- "Who are the main suppliers for AAPL?"
- "Get the EUR/USD exchange rate history"
- "What SEC filings has Microsoft made this year?"
- "Show me NVDA's free cash flow over the last 8 quarters"
- "What's the economic calendar for next week?"

## Architecture

```
LLM (Claude, etc.) <--> MCP Server <--> Axion REST API
```

## Troubleshooting

**Tools not appearing in your LLM client** - Restart the client and verify the config file path is correct and absolute.

**API requests failing** - Check that `API_KEY` is set correctly in your environment or config. Review server logs for detailed error messages.

**Server won't start** - Ensure Node.js v18+ is installed and the package is installed via `npm i @axionquant/mcp`.

## Get Started

For detailed API documentation, support, or to obtain an API key, visit the [Axion](https://axionquant.com) website.

## License

MIT
