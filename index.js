#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_BASE_URL = 'https://api.axionquant.com/';
const API_KEY = process.env.API_KEY;

/**
 * Helper function to make API requests
 */
async function makeApiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch from ${url}: ${error.message}`);
  }
}

/**
 * Helper function to build query strings from object
 */
function buildQueryString(params) {
  const filtered = Object.entries(params || {})
  .filter(([_, value]) => value !== undefined && value !== null && value !== '')
  .map(([key, value]) => `${key}=${encodeURIComponent(value)}`);

  return filtered.length > 0 ? `?${filtered.join('&')}` : '';
}

/**
 * Create the MCP server
 */
const server = new Server(
  {
    name: "axion-financial-data",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List all available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "credit_search",
        description: "Search for credit entities by name, sector, country, or state",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query (organization name)"
            },
          }
        }
      },
      {
        name: "credit_ratings",
        description: "Get credit ratings for a specific organization by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Organization ID (from search results)"
            }
          },
          required: ["id"]
        }
      },
      {
        name: "econ_search",
        description: "Search for economic datasets (FRED)",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query for economic indicators"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "econ_dataset",
        description: "Get economic dataset time series data by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Dataset ID (from search results, e.g., 'PMAIZMTUSDM')"
            }
          },
          required: ["id"]
        }
      },
      {
        name: "econ_calendar",
        description: "Get economic calendar events with filtering options",
        inputSchema: {
          type: "object",
          properties: {
            from: {
              type: "string",
              description: "Start date (YYYY-MM-DD)"
            },
            to: {
              type: "string",
              description: "End date (YYYY-MM-DD)"
            },
            country: {
              type: "string",
              description: "Country code or comma-separated list (e.g., 'US' or 'US,GB,JP')"
            },
            minImportance: {
              type: "integer",
              description: "Minimum importance level (0-3, where 3 is highest)",
              minimum: -1,
              maximum: 3
            },
            currency: {
              type: "string",
              description: "Currency code or comma-separated list (e.g., 'USD' or 'USD,EUR,GBP')"
            },
            category: {
              type: "string",
              description: "Category or comma-separated list (e.g., 'gov' or 'gov,infl')"
            }
          }
        }
      },
      {
        name: "esg_data",
        description: "Get ESG (Environmental, Social, Governance) scores for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "etf_fund",
        description: "Get ETF fund information including ratings, metrics, and classification",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "ETF ticker symbol (e.g., 'SPY' for SPDR S&P 500 ETF Trust)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "etf_weights",
        description: "Get ETF sector and region allocation weights",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "ETF ticker symbol (e.g., 'SPY' for SPDR S&P 500 ETF Trust)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "etf_holdings",
        description: "Get ETF top holdings including weight, shares, and market value",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "ETF ticker symbol (e.g., 'SPY' for SPDR S&P 500 ETF Trust)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "etf_exposure",
        description: "Get which other ETFs hold a specific ticker (inverse exposure)",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple) to find ETFs that hold it"
            }
          },
          required: ["ticker"]
        }
      },
      // News tools
      {
        name: "news_ticker",
        description: "Get news for a specific company by ticker symbol",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "news_country",
        description: "Get news for a specific country",
        inputSchema: {
          type: "object",
          properties: {
            country: {
              type: "string",
              description: "Country name or code (e.g., 'US', 'United States')"
            }
          },
          required: ["country"]
        }
      },
      {
        name: "news_category",
        description: "Get news for a specific category",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "News category (e.g., 'business', 'technology', 'politics')"
              }
          },
          required: ["category"]
        }
      },
      {
        name: "news_general",
        description: "Get general news headlines",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      // Sentiment analysis tools
      {
        name: "sentiment_social",
        description: "Get social media sentiment for a specific ticker (from Google, Reddit, Twitter)",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "sentiment_news",
        description: "Get news sentiment for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "sentiment_analyst",
        description: "Get analyst/AI sentiment for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      // Supply chain tools
      {
        name: "supply_chain_customers",
        description: "Get supply chain customers for a specific company by ticker symbol",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "supply_chain_peers",
        description: "Get supply chain peers (competitors) for a specific company by ticker symbol",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "supply_chain_suppliers",
        description: "Get supply chain suppliers for a specific company by ticker symbol",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_asset",
        description: "Get asset profile information for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_recommendation",
        description: "Get recommendation trend for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_cashflow",
        description: "Get cash flow statement history for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_trend_index",
        description: "Get index trend information for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_statistics",
        description: "Get default key statistics for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_income",
        description: "Get income statement history for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_fund",
        description: "Get fund ownership data for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_summary",
        description: "Get summary detail information for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_insiders",
        description: "Get insider holders information for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_calendar",
        description: "Get calendar events for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_balancesheet",
        description: "Get balance sheet history for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_trend_earnings",
        description: "Get earnings trend for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_institution",
        description: "Get institution ownership data for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_ownership",
        description: "Get major holders breakdown for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_earnings",
        description: "Get earnings history for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_info",
        description: "Get summary profile information for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_activity",
        description: "Get net share purchase activity for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_transactions",
        description: "Get insider transactions for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_financials",
        description: "Get financial data for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_traffic",
        description: "Get website traffic data for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL' for Apple)"
            }
          },
          required: ["ticker"]
        }
      },

      {
        name: "crypto_tickers",
        description: "Get list of cryptocurrency tickers, optionally filtered by type",
        inputSchema: {
          type: "object",
          properties: {
            type: {
              type: "string",
              description: "Filter by type (e.g., 'spot')"
            }
          }
        }
      },
      {
        name: "crypto_ticker",
        description: "Get details for a specific cryptocurrency by ticker symbol",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Cryptocurrency ticker symbol (e.g., 'BTC', 'ETH')"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "crypto_prices",
        description: "Get historical price data for a cryptocurrency ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Cryptocurrency ticker symbol (e.g., 'BTC', 'ETH')"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "forex_tickers",
        description: "Get list of forex tickers with optional filtering by country or exchange",
        inputSchema: {
          type: "object",
          properties: {
            country: {
              type: "string",
              description: "Filter by country code (e.g., 'US', 'AE')"
            },
            exchange: {
              type: "string",
              description: "Filter by exchange (e.g., 'IDC')"
            }
          }
        }
      },
      {
        name: "forex_ticker",
        description: "Get details for a specific forex pair by ticker symbol",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Forex ticker symbol (e.g., 'AEDAUD', 'EURUSD')"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "forex_prices",
        description: "Get historical price data for a forex ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Forex ticker symbol (e.g., 'AEDAUD', 'EURUSD')"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "future_tickers",
        description: "Get list of futures tickers with optional filtering by exchange",
        inputSchema: {
          type: "object",
          properties: {
            exchange: {
              type: "string",
              description: "Filter by exchange (e.g., 'CME', 'CMX')"
            }
          }
        }
      },
      {
        name: "future_ticker",
        description: "Get details for a specific futures contract by ticker symbol",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Futures ticker symbol (e.g., 'ALI', 'M6A', 'BTC')"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "future_prices",
        description: "Get historical price data for a futures contract",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Futures ticker symbol (e.g., 'ALI', 'M6A', 'BTC')"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "indices_tickers",
        description: "Get list of index tickers with optional filtering by exchange",
        inputSchema: {
          type: "object",
          properties: {
            exchange: {
              type: "string",
              description: "Filter by exchange (e.g., 'ASX', 'AMS', 'VIE')"
            }
          }
        }
      },
      {
        name: "indices_ticker",
        description: "Get details for a specific index by ticker symbol",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Index ticker symbol (e.g., 'AXJO', 'AEX', 'ATX')"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "indices_prices",
        description: "Get historical price data for an index",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Index ticker symbol (e.g., 'AXJO', 'AEX', 'ATX')"
            }
          },
          required: ["ticker"]
        }
      },

      {
        name: "indices_tickers",
        description: "Get list of index tickers with optional filtering by exchange",
        inputSchema: {
          type: "object",
          properties: {
            exchange: {
              type: "string",
              description: "Filter by exchange (e.g., 'ASX', 'AMS', 'VIE')"
            }
          }
        }
      },
      {
        name: "indices_ticker",
        description: "Get details for a specific index by ticker symbol",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Index ticker symbol (e.g., 'AXJO', 'AEX', 'ATX')"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "indices_prices",
        description: "Get historical price data for an index",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Index ticker symbol (e.g., 'AXJO', 'AEX', 'ATX')"
            }
          },
          required: ["ticker"]
        }
      },

      {
        name: "stocks_tickers",
        description: "Get list of stock tickers with optional filtering by country or exchange",
        inputSchema: {
          type: "object",
          properties: {
            country: {
              type: "string",
              description: "Filter by country (e.g., 'america')"
            },
            exchange: {
              type: "string",
              description: "Filter by exchange (e.g., 'NASDAQ', 'AMEX', 'OTC')"
            }
          }
        }
      },
      {
        name: "stocks_ticker",
        description: "Get details for a specific stock by ticker symbol",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL', 'MSFT', 'TSLA')"
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "stocks_prices",
        description: "Get historical price data for a stock",
        inputSchema: {
          type: "object",
          properties: {
            ticker: {
              type: "string",
              description: "Stock ticker symbol (e.g., 'AAPL', 'MSFT', 'TSLA')"
            }
          },
          required: ["ticker"]
        }
      }


    ],
  };
});

/**
 * Handle tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    let endpoint;

    switch (name) {
      case "credit_search":
        // Build query parameters for search
        const queryParams = buildQueryString({
          query: args.query,
        });
        endpoint = `credit/search${queryParams}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "credit_ratings":
        if (!args.id) {
          throw new Error("Organization ID is required");
        }
        endpoint = `credit/ratings/${args.id}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "econ_search":
        if (!args.query) {
          throw new Error("Search query is required");
        }
        endpoint = `econ/search${buildQueryString({ query: args.query })}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "econ_dataset":
        if (!args.id) {
          throw new Error("Dataset ID is required");
        }
        endpoint = `econ/dataset/${args.id}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "econ_calendar":
        endpoint = `econ/calendar${buildQueryString({
from: args.from,
to: args.to,
country: args.country,
minImportance: args.minImportance,
currency: args.currency,
category: args.category
})}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "esg_data":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `esg/${args.ticker}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "etf_fund":
        if (!args.ticker) {
          throw new Error("ETF ticker symbol is required");
        }
        endpoint = `etf/${args.ticker}/fund`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "etf_weights":
        if (!args.ticker) {
          throw new Error("ETF ticker symbol is required");
        }
        endpoint = `etf/${args.ticker}/weights`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "etf_holdings":
        if (!args.ticker) {
          throw new Error("ETF ticker symbol is required");
        }
        endpoint = `etf/${args.ticker}/holdings`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "etf_exposure":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `etf/${args.ticker}/exposure`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      // News handlers
      case "news_ticker":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `news/${args.ticker}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "news_country":
        if (!args.country) {
          throw new Error("Country parameter is required");
        }
        endpoint = `news/country/${encodeURIComponent(args.country)}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "news_category":
        if (!args.category) {
          throw new Error("Category parameter is required");
        }
        endpoint = `news/category/${encodeURIComponent(args.category)}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "news_general":
        endpoint = `news`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      // Sentiment analysis handlers
      case "sentiment_social":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `sentiment/${args.ticker}/social`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "sentiment_news":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `sentiment/${args.ticker}/news`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "sentiment_analyst":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `sentiment/${args.ticker}/analyst`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      // Supply chain handlers
      case "supply_chain_customers":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `supply-chain/${args.ticker}/customers`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "supply_chain_peers":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `supply-chain/${args.ticker}/peers`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "supply_chain_suppliers":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `supply-chain/${args.ticker}/suppliers`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_asset":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/asset`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_recommendation":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/recommendation`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_cashflow":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/cashflow`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_trend_index":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/trend/index`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_statistics":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/statistics`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_income":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/income`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_fund":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/fund`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_summary":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/summary`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_insiders":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/insiders`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_calendar":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/calendar`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_balancesheet":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/balancesheet`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_trend_earnings":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/trend/earnings`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_institution":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/institution`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_ownership":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/ownership`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_earnings":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/earnings`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_info":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/info`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_activity":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/activity`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_transactions":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/transactions`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_financials":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/financials`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "profiles_traffic":
        if (!args.ticker) {
          throw new Error("Ticker symbol is required");
        }
        endpoint = `profiles/${args.ticker}/traffic`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;


      // Crypto handlers
      case "crypto_tickers":
        endpoint = `crypto/tickers${buildQueryString({
type: args.type
})}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "crypto_ticker":
        if (!args.ticker) {
          throw new Error("Cryptocurrency ticker symbol is required");
        }
        endpoint = `crypto/${args.ticker}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "crypto_prices":
        if (!args.ticker) {
          throw new Error("Cryptocurrency ticker symbol is required");
        }
        endpoint = `crypto/${args.ticker}/prices`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      // Forex handlers
      case "forex_tickers":
        endpoint = `forex/tickers${buildQueryString({
country: args.country,
exchange: args.exchange
})}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "forex_ticker":
        if (!args.ticker) {
          throw new Error("Forex ticker symbol is required");
        }
        endpoint = `forex/${args.ticker}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "forex_prices":
        if (!args.ticker) {
          throw new Error("Forex ticker symbol is required");
        }
        endpoint = `forex/${args.ticker}/prices`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      // Futures handlers
      case "future_tickers":
        endpoint = `future/tickers${buildQueryString({
exchange: args.exchange
})}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "future_ticker":
        if (!args.ticker) {
          throw new Error("Futures ticker symbol is required");
        }
        endpoint = `future/${args.ticker}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "future_prices":
        if (!args.ticker) {
          throw new Error("Futures ticker symbol is required");
        }
        endpoint = `future/${args.ticker}/prices`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      // Indices handlers
      case "indices_tickers":
        endpoint = `indices/tickers${buildQueryString({
exchange: args.exchange
})}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "indices_ticker":
        if (!args.ticker) {
          throw new Error("Index ticker symbol is required");
        }
        endpoint = `indices/${args.ticker}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "indices_prices":
        if (!args.ticker) {
          throw new Error("Index ticker symbol is required");
        }
        endpoint = `indices/${args.ticker}/prices`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;


      // Stocks handlers
      case "stocks_tickers":
        endpoint = `stocks/tickers${buildQueryString({
country: args.country,
exchange: args.exchange
})}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "stocks_ticker":
        if (!args.ticker) {
          throw new Error("Stock ticker symbol is required");
        }
        endpoint = `stocks/${args.ticker}`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      case "stocks_prices":
        if (!args.ticker) {
          throw new Error("Stock ticker symbol is required");
        }
        endpoint = `stocks/${args.ticker}/prices`;
        result = await makeApiRequest(endpoint, { method: 'GET' });
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Axion MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
