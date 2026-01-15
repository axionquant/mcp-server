# Axion MCP Server

A Model Context Protocol (MCP) server that provides LLM access to the Axion financial data API endpoints.

## Overview

This MCP server exposes all Axion product API endpoints as LLM-accessible tools, enabling AI assistants to query financial data including stocks, cryptocurrencies, forex, futures, indices, ETFs, credit ratings, ESG data, and supply chain information.

## Installation

1. Install dependencies:
```bash
cd server/mcp-server
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set:
- `API_KEY`: Your API authentication key (if required)

## Usage

### Running the Server

```bash
npm start
```

### Configuring with Claude Desktop

Add this to your Claude Desktop configuration file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "axion-financial-data": {
      "command": "node",
      "args": ["/absolute/path/to/axion/server/mcp-server/index.js"],
      "env": {
        "API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Using with Other MCP Clients

The server uses stdio transport, making it compatible with any MCP client. Configure according to your client's documentation.

## Available Tools

### Stock Market Tools
- `get_stock_tickers` - Get all stock tickers with optional country/exchange filtering
- `get_stock_ticker_info` - Get detailed info for a specific stock
- `get_stock_prices` - Get historical price data for a stock

### Cryptocurrency Tools
- `get_crypto_tickers` - Get all crypto tickers
- `get_crypto_ticker_info` - Get detailed info for a specific crypto
- `get_crypto_prices` - Get historical price data for a crypto

### Forex Tools
- `get_forex_tickers` - Get all forex pairs
- `get_forex_ticker_info` - Get detailed info for a forex pair
- `get_forex_prices` - Get historical price data for a forex pair

### Futures Tools
- `get_futures_tickers` - Get all futures tickers
- `get_futures_ticker_info` - Get detailed info for a futures contract
- `get_futures_prices` - Get historical price data for a futures contract

### Indices Tools
- `get_indices_tickers` - Get all market indices
- `get_indices_ticker_info` - Get detailed info for an index
- `get_indices_prices` - Get historical price data for an index

### ETF Tools
- `get_etf_fund_data` - Get comprehensive fund data including weights and regions
- `get_etf_holdings` - Get detailed holdings information
- `get_etf_exposure` - Get exposure analysis

### Credit Rating Tools
- `search_credit_entities` - Search S&P credit rating database
- `get_credit_ratings` - Get credit ratings for a specific entity

### ESG Tools
- `get_esg_data` - Get ESG (Environmental, Social, Governance) data for a ticker

### Supply Chain Tools
- `get_company_customers` - Get a company's customers
- `get_company_peers` - Get peer companies (competitors)
- `get_company_suppliers` - Get a company's suppliers

## Example Queries

Once configured with an LLM client like Claude Desktop, you can ask:

- "What are the current stock tickers for NASDAQ?"
- "Get me the historical prices for Bitcoin over the last month"
- "What are the top holdings in the SPY ETF?"
- "Search for Apple's credit rating"
- "Show me Tesla's ESG data"
- "Who are the main suppliers for AAPL?"
- "Get forex rates for EUR/USD"

## Architecture

The MCP server acts as a bridge between LLMs and your Axion REST API:

```
LLM (Claude, etc.) <--> MCP Server <--> Axion REST API
```

All API requests are proxied through the MCP server, which translates LLM tool calls into REST API requests.

## Development

### Project Structure
```
server/mcp-server/
├── index.js          # Main MCP server implementation
├── package.json      # Node.js dependencies
├── .env.example      # Environment variable template
└── README.md         # This file
```

### Adding New Tools

To add new API endpoints:

1. Add the tool definition in `ListToolsRequestSchema` handler
2. Add the corresponding case in `CallToolRequestSchema` handler
3. Update this README with the new tool

## Troubleshooting

### Server won't start
- Ensure Node.js is installed (v18+ recommended)
- Check that all dependencies are installed: `npm install`
- Verify the `.env` file exists and has correct values

### Tools not appearing in LLM
- Restart your MCP client (e.g., Claude Desktop)
- Check the client configuration file has the correct absolute path
- Verify the server is running without errors

### API requests failing
- Ensure your Axion API server is running
- Verify API_KEY if authentication is required
- Check server logs for detailed error messages

## License

MIT
