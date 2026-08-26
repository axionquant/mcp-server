# AxionQuant MCP Server

**Give Claude, ChatGPT, and other LLMs real-time financial data.** A Model Context Protocol (MCP) server for the [AxionQuant](https://axionquant.com) financial data API - covering stocks, crypto, forex, futures, indices, ETFs, economic data, news, sentiment, SEC filings, financials, insider trading, ESG, and credit ratings.

[![npm version](https://img.shields.io/npm/v/@axionquant/mcp.svg)](https://www.npmjs.com/package/@axionquant/mcp)
[![npm downloads](https://img.shields.io/npm/dm/@axionquant/mcp.svg)](https://www.npmjs.com/package/@axionquant/mcp)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](#license)

**[Website](https://axionquant.com)** · **[Documentation](https://axionquant.com/docs)** · **[Get an API Key](https://axionquant.com/dashboard/api-keys)**

The AxionQuant MCP server plugs directly into Claude Desktop and any other MCP-compatible client, letting an LLM answer natural-language financial questions - stock quotes, crypto prices, SEC filings, earnings transcripts, economic indicators, and more - using live data instead of stale training data.

## Why AxionQuant MCP?

- **100+ tools in one server** - market data, fundamentals, alternative data, and macro indicators across every major asset class
- **Works with any MCP client** - Claude Desktop today, and any client that supports stdio transport
- **Natural-language financial queries** - no need to learn an API schema; just ask
- **One API key, one config block** - minimal setup to get an LLM talking to live market data

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
  - [Claude Desktop](#claude-desktop)
  - [Other MCP Clients](#other-mcp-clients)
- [Available Tools](#available-tools)
- [Example Queries](#example-queries)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Get Started](#get-started)
- [License](#license)

## Installation

```bash
npm i @axionquant/mcp
```

## Configuration

[Get your free AxionQuant API key](https://axionquant.com/dashboard/api-keys)

### Claude Desktop

Add the following to your Claude Desktop MCP config file to connect AxionQuant's financial data tools:

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

Real-time quotes and historical price data for US and global equities.

| Tool | Description |
|------|-------------|
| `stocks_tickers` | List stock tickers, optionally filtered by country or exchange |
| `stocks_quote` | Get current quote/details for a stock ticker |
| `stocks_prices` | Get historical price data (supports `from`, `to`, `frame`) |

### Crypto

Cryptocurrency pricing and market data.

| Tool | Description |
|------|-------------|
| `crypto_tickers` | List cryptocurrency tickers, optionally filtered by type |
| `crypto_quote` | Get current details for a cryptocurrency |
| `crypto_prices` | Get historical price data |

### Forex

Foreign exchange rates and currency pair data.

| Tool | Description |
|------|-------------|
| `forex_tickers` | List forex pairs, optionally filtered by country or exchange |
| `forex_quote` | Get current details for a forex pair |
| `forex_prices` | Get historical price data |

### Futures

Futures contract pricing and market data.

| Tool | Description |
|------|-------------|
| `futures_tickers` | List futures tickers, optionally filtered by exchange |
| `futures_quote` | Get current details for a futures contract |
| `futures_prices` | Get historical price data |

### Indices

Market index pricing and composition data.

| Tool | Description |
|------|-------------|
| `indices_tickers` | List index tickers, optionally filtered by exchange |
| `indices_quote` | Get current details for an index |
| `indices_prices` | Get historical price data |

### ETFs

ETF holdings, exposure, and fund metrics.

| Tool | Description |
|------|-------------|
| `etf_fund` | Get ETF fund information including ratings and metrics |
| `etf_holdings` | Get top holdings with weights, shares, and market value |
| `etf_holdings_all` | Get all ETF holdings with weights and last updated date |
| `etf_exposure` | Find which ETFs hold a specific stock ticker |

### Economics (FRED)

Macroeconomic datasets and calendar events sourced from FRED.

| Tool | Description |
|------|-------------|
| `econ_search` | Search for economic datasets |
| `econ_dataset` | Get a time series by dataset ID |
| `econ_calendar` | Get economic calendar events (filterable by country, currency, category, importance) |

### News

Market news headlines by company, country, or category.

| Tool | Description |
|------|-------------|
| `news_general` | Get general market news headlines |
| `news_ticker` | Get news for a specific company |
| `news_country` | Get news for a specific country |
| `news_category` | Get news by category (e.g. `business`, `technology`) |

### Sentiment

Social, news, and analyst sentiment scoring.

| Tool | Description |
|------|-------------|
| `sentiment_all` | Get combined sentiment (social + news + analyst) for a ticker |
| `sentiment_social` | Get social media sentiment |
| `sentiment_news` | Get news sentiment |
| `sentiment_analyst` | Get analyst/AI sentiment |

### Profiles

Company profiles, analyst recommendations, and key statistics.

| Tool | Description |
|------|-------------|
| `profiles_profile` | Get full asset profile |
| `profiles_recommendation` | Get analyst recommendation trend |
| `profiles_statistics` | Get key statistics |
| `profiles_summary` | Get summary detail |
| `profiles_calendar` | Get earnings and dividend calendar events |
| `profiles_info` | Get company info / summary profile |

### Earnings

Earnings history, trends, and quarterly reports.

| Tool | Description |
|------|-------------|
| `earnings_history` | Get historical earnings |
| `earnings_trend` | Get earnings trend |
| `earnings_index` | Get index trend |
| `earnings_report` | Get earnings report for a specific year and quarter |

### SEC Filings

Search and retrieve SEC filings by form type and date.

| Tool | Description |
|------|-------------|
| `filings_recent` | Get recent filings, optionally filtered by form type |
| `filings_forms` | Get filings by form type (e.g. `10-K`, `8-K`) |
| `filings_list_forms` | List all available SEC form types |
| `filings_search` | Search filings by year/quarter |

### Financials

Financial statements, historical fundamentals, valuation ratios, and DCF analysis.

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
| `financials_eps` | TTM earnings per share |
| `financials_pe` | Price-to-earnings ratio |
| `financials_market_cap` | Market capitalization |
| `financials_roe` | Return on equity |
| `financials_enterprise_value` | Enterprise value |
| `financials_ebitda` | TTM EBITDA |
| `financials_debt_to_equity` | Debt-to-equity ratio |
| `financials_dcf_value` | DCF valuation (enterprise value, fair price, margin of safety, recommendation) |
| `financials_dcf_rate` | Discount rate / WACC calculation (cost of equity, cost of debt, capital structure) |

### Insiders & Ownership

Insider trading activity and institutional ownership data.

| Tool | Description |
|------|-------------|
| `insiders_funds` | Fund ownership data |
| `insiders_individuals` | Insider holders (individuals) |
| `insiders_institutions` | Institutional ownership |
| `insiders_ownership` | Major holders breakdown |
| `insiders_activity` | Net share purchase activity |
| `insiders_transactions` | Insider transactions |

### ESG

Environmental, social, and governance scoring.

| Tool | Description |
|------|-------------|
| `esg_data` | Get ESG (Environmental, Social, Governance) scores for a ticker |

### Supply Chain

Company customer, supplier, and peer relationships.

| Tool | Description |
|------|-------------|
| `supply_chain_customers` | Get a company's customers |
| `supply_chain_peers` | Get peer companies / competitors |
| `supply_chain_suppliers` | Get a company's suppliers |

### Credit

Credit ratings from the S&P database.

| Tool | Description |
|------|-------------|
| `credit_search` | Search the S&P credit rating database by organization name |
| `credit_ratings` | Get credit ratings for a specific organization by ID |

### Web Traffic

Website traffic estimates by company.

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

## FAQ

**What is the AxionQuant MCP server?**
It's a Model Context Protocol server that connects LLMs like Claude to the AxionQuant financial data API, so you can ask natural-language questions about stocks, crypto, earnings, SEC filings, and more instead of writing API calls by hand.

**Does the AxionQuant MCP server work with Claude Desktop?**
Yes - add it to your Claude Desktop config file as shown above. It also works with any client that supports the Model Context Protocol over stdio transport.

**Is there a free AxionQuant API key?**
Yes - you can [get a free API key](https://axionquant.com/dashboard/api-keys) from the AxionQuant dashboard.

**What financial data can I query through MCP?**
Stocks, crypto, forex, futures, indices, and ETFs, plus financial statements, earnings, SEC filings, insider trading, sentiment, news, economic (FRED) data, credit ratings, ESG scores, supply chain relationships, and web traffic estimates - over 100 tools in total.

## Get Started

For full API documentation, visit the [AxionQuant docs](https://axionquant.com/docs). For support or to obtain an API key, visit [axionquant.com](https://axionquant.com).

## License

MIT
