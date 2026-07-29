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

const server = new Server(
  {
    name: "axion-financial-data",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // ---------- Credit ----------
      {
        name: "credit_search",
        description: "Search for credit entities by organization name",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Organization name to search" }
          },
          required: ["query"]
        }
      },
      {
        name: "credit_ratings",
        description: "Get credit ratings for a specific organization by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "Organization ID from search results" }
          },
          required: ["id"]
        }
      },

      // ---------- ESG ----------
      {
        name: "esg_data",
        description: "Get ESG scores for a specific ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker (e.g., AAPL)" }
          },
          required: ["ticker"]
        }
      },

      // ---------- ETF (note plural endpoints) ----------
       {
        name: "etf_tickers",
        description: "List etf tickers, optionally filtered by country or exchange",
        inputSchema: {
          type: "object",
          properties: {
            country: { type: "string", description: "Filter by country (e.g., 'america')" },
            exchange: { type: "string", description: "Filter by exchange (e.g., 'NASDAQ')" }
          }
        }
      },
      {
        name: "etf_gainers",
        description: "Get top ETF gainers",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "etf_losers",
        description: "Get top ETF losers",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "etf_list_market",
        description: "Get unique market values for ETFs",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "etf_list_country",
        description: "Get unique country values for ETFs",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "etf_list_currency",
        description: "Get unique currency values for ETFs",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "etf_list_sector",
        description: "Get unique sector values for ETFs",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "etf_list_industry",
        description: "Get unique industry values for ETFs",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "etf_list_type",
        description: "Get unique type values for ETFs",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "etf_quote",
        description: "Get an ETF quote",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "ETF ticker (e.g., SPY)" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "etf_prices",
        description: "Get historical price data for an etf",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "ETF ticker" },
            from: { type: "string", description: "Start date (YYYY-MM-DD)" },
            to: { type: "string", description: "End date (YYYY-MM-DD)" },
            frame: { type: "string", description: "Time frame (e.g., '1d', '1wk', '1mo')" }
          },
          required: ["ticker"]
        }
      },

      {
        name: "etf_fund",
        description: "Get ETF fund information including ratings and metrics",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "ETF ticker (e.g., SPY)" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "etf_holdings",
        description: "Get ETF top holdings with weights, shares, and market value",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "ETF ticker (e.g., SPY)" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "etf_holdings_all",
        description: "Get all ETF holdings with weights and last updated date",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "ETF ticker (e.g., SPY)" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "etf_exposure",
        description: "Find which ETFs hold a specific stock ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker (e.g., AAPL)" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "etf_weights",
        description: "Find what percentage of each sector industry and stocks make up the ETF",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker (e.g., AAPL)" }
          },
          required: ["ticker"]
        }
      },

      // ---------- Supply Chain ----------
      {
        name: "supply_chain_customers",
        description: "Get supply chain customers for a company",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "supply_chain_peers",
        description: "Get supply chain competitors for a company",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "supply_chain_suppliers",
        description: "Get supply chain suppliers for a company",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },

      // ---------- Stocks ----------
      {
        name: "stocks_tickers",
        description: "List stock tickers, optionally filtered by country or exchange",
        inputSchema: {
          type: "object",
          properties: {
            country: { type: "string", description: "Filter by country (e.g., 'america')" },
            exchange: { type: "string", description: "Filter by exchange (e.g., 'NASDAQ')" }
          }
        }
      },
      {
        name: "stocks_gainers",
        description: "Get top stock gainers",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "stocks_losers",
        description: "Get top stock losers",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "stocks_list_market",
        description: "Get unique market values for stocks",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "stocks_list_country",
        description: "Get unique country values for stocks",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "stocks_list_currency",
        description: "Get unique currency values for stocks",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "stocks_list_sector",
        description: "Get unique sector values for stocks",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "stocks_list_industry",
        description: "Get unique industry values for stocks",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "stocks_list_type",
        description: "Get unique type values for stocks",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "stocks_quote",
        description: "Get a stock quote",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker (e.g., AAPL)" }
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
            ticker: { type: "string", description: "Stock ticker" },
            from: { type: "string", description: "Start date (YYYY-MM-DD)" },
            to: { type: "string", description: "End date (YYYY-MM-DD)" },
            frame: { type: "string", description: "Time frame (e.g., '1d', '1wk', '1mo')" }
          },
          required: ["ticker"]
        }
      },

      // ---------- Crypto ----------
      {
        name: "crypto_tickers",
        description: "List cryptocurrency tickers, optionally filtered by type",
        inputSchema: {
          type: "object",
          properties: {
            type: { type: "string", description: "Filter by type (e.g., 'spot')" }
          }
        }
      },
      {
        name: "crypto_gainers",
        description: "Get top crypto gainers",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "crypto_losers",
        description: "Get top crypto losers",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "crypto_list_category",
        description: "Get unique category values for crypto",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "crypto_list_rating",
        description: "Get unique rating values for crypto",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "crypto_list_type",
        description: "Get unique type values for crypto",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "crypto_quote",
        description: "Get a cryptocurrency quote",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Crypto ticker (e.g., BTC)" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "crypto_prices",
        description: "Get historical price data for a cryptocurrency",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Crypto ticker" },
            from: { type: "string", description: "Start date (YYYY-MM-DD)" },
            to: { type: "string", description: "End date (YYYY-MM-DD)" },
            frame: { type: "string", description: "Time frame (e.g., '1d', '1wk', '1mo')" }
          },
          required: ["ticker"]
        }
      },

      // ---------- Forex ----------
      {
        name: "forex_tickers",
        description: "List forex tickers, optionally filtered by country or exchange",
        inputSchema: {
          type: "object",
          properties: {
            country: { type: "string", description: "Country code (e.g., 'US', 'AE')" },
            exchange: { type: "string", description: "Exchange (e.g., 'IDC')" }
          }
        }
      },
      {
        name: "forex_gainers",
        description: "Get top forex gainers",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "forex_losers",
        description: "Get top forex losers",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "forex_list_exchange",
        description: "Get unique exchange values for forex",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "forex_list_rating",
        description: "Get unique rating values for forex",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "forex_list_country",
        description: "Get unique country values for forex",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "forex_quote",
        description: "Get a forex pair quote",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Forex ticker (e.g., EURUSD)" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "forex_prices",
        description: "Get historical price data for a forex pair",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Forex ticker" },
            from: { type: "string", description: "Start date (YYYY-MM-DD)" },
            to: { type: "string", description: "End date (YYYY-MM-DD)" },
            frame: { type: "string", description: "Time frame (e.g., '1d', '1wk', '1mo')" }
          },
          required: ["ticker"]
        }
      },

      // ---------- Futures (renamed from 'future' to 'futures') ----------
      {
        name: "futures_tickers",
        description: "List futures tickers, optionally filtered by exchange",
        inputSchema: {
          type: "object",
          properties: {
            exchange: { type: "string", description: "Exchange (e.g., 'CME', 'CMX')" }
          }
        }
      },
      {
        name: "futures_gainers",
        description: "Get top futures gainers",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "futures_losers",
        description: "Get top futures losers",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "futures_list_exchange",
        description: "Get unique exchange values for futures",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "futures_list_currency",
        description: "Get unique currency values for futures",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "futures_list_timezone",
        description: "Get unique timezone values for futures",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "futures_list_country",
        description: "Get unique country values for futures",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "futures_quote",
        description: "Get a futures contract quote",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Futures ticker (e.g., 'ALI', 'M6A')" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "futures_prices",
        description: "Get historical price data for a futures contract",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Futures ticker" },
            from: { type: "string", description: "Start date (YYYY-MM-DD)" },
            to: { type: "string", description: "End date (YYYY-MM-DD)" },
            frame: { type: "string", description: "Time frame (e.g., '1d', '1wk', '1mo')" }
          },
          required: ["ticker"]
        }
      },

      // ---------- Indices ----------
      {
        name: "indices_tickers",
        description: "List index tickers, optionally filtered by exchange",
        inputSchema: {
          type: "object",
          properties: {
            exchange: { type: "string", description: "Exchange (e.g., 'ASX', 'AMS')" }
          }
        }
      },
      {
        name: "indices_gainers",
        description: "Get top index gainers",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "indices_losers",
        description: "Get top index losers",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "indices_list_exchange",
        description: "Get unique exchange values for indices",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "indices_list_timezone",
        description: "Get unique timezone values for indices",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "indices_list_country",
        description: "Get unique country values for indices",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "indices_quote",
        description: "Get an index quote",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Index ticker (e.g., 'AXJO', 'AEX')" }
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
            ticker: { type: "string", description: "Index ticker" },
            from: { type: "string", description: "Start date (YYYY-MM-DD)" },
            to: { type: "string", description: "End date (YYYY-MM-DD)" },
            frame: { type: "string", description: "Time frame (e.g., '1d', '1wk', '1mo')" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "indices_components",
        description: "Get the component stocks that make up an index",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Index ticker (e.g., 'SPX', 'AXJO')" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "indices_exposure",
        description: "Find which indices hold a specific ticker as a component",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker to find index exposure for" }
          },
          required: ["ticker"]
        }
      },

      // ---------- Economics  ----------
      {
        name: "econ_search",
        description: "Search for economic datasets (FRED)",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" }
          },
          required: ["query"]
        }
      },
      {
        name: "econ_dataset",
        description: "Get economic dataset time series by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "Dataset ID (e.g., 'PMAIZMTUSDM')" }
          },
          required: ["id"]
        }
      },
      {
        name: "econ_calendar",
        description: "Get economic calendar events",
        inputSchema: {
          type: "object",
          properties: {
            from: { type: "string", description: "Start date (YYYY-MM-DD)" },
            to: { type: "string", description: "End date (YYYY-MM-DD)" },
            country: { type: "string", description: "Country code(s) comma-separated" },
            minImportance: { type: "integer", minimum: -1, maximum: 3, description: "Minimum importance (0-3)" },
            currency: { type: "string", description: "Currency code(s) comma-separated" },
            category: { type: "string", description: "Category (e.g., 'gov', 'infl')" },
            limit: { type: "integer", description: "Number of events to return (default 10)" }
          }
        }
      },
      {
        name: "econ_find",
        description: "Find economic datasets using natural language description (AI-powered)",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Natural language description of the data you need" }
          },
          required: ["query"]
        }
      },

      // ---------- News ----------
      {
        name: "news_general",
        description: "Get general news headlines",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "news_ticker",
        description: "Get news for a specific company by ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
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
            country: { type: "string", description: "Country name or code" }
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
            category: { type: "string", description: "Category (e.g., 'business', 'technology')" }
          },
          required: ["category"]
        }
      },
      {
        name: "news_article",
        description: "Get the full URL for a news article by its encoded ID",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "Article ID from news results" }
          },
          required: ["id"]
        }
      },

      // ---------- Sentiment ----------
      {
        name: "sentiment_all",
        description: "Get combined sentiment (social, news, analyst) for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "sentiment_social",
        description: "Get social media sentiment for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "sentiment_news",
        description: "Get news sentiment for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "sentiment_analyst",
        description: "Get analyst/AI sentiment for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },

      // ---------- Profiles  ----------
      {
        name: "profiles_profile",
        description: "Get full asset profile for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_recommendation",
        description: "Get recommendation trend for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_statistics",
        description: "Get key statistics for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_summary",
        description: "Get summary detail for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_calendar",
        description: "Get calendar events (earnings, dividends) for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "profiles_info",
        description: "Get company info / summary profile for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },

      // ---------- Earnings ----------
      {
        name: "earnings_history",
        description: "Get earnings history for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "earnings_trend",
        description: "Get earnings trend for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "earnings_index",
        description: "Get index trend for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "earnings_report",
        description: "Get earnings report for a specific year and quarter",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            year: { type: "string", description: "Year (e.g., '2024')" },
            quarter: { type: "string", description: "Quarter (e.g., 'Q1')" }
          },
          required: ["ticker", "year", "quarter"]
        }
      },
      {
        name: "earnings_transcript",
        description: "Get earnings call transcript for a ticker, year, and quarter",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            year: { type: "string", description: "Year (e.g., '2024')" },
            quarter: { type: "string", description: "Quarter (e.g., '2')" }
          },
          required: ["ticker", "year", "quarter"]
        }
      },
      {
        name: "earnings_transcript_sentiment",
        description: "Get sentiment analysis of an earnings call transcript",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            year: { type: "string", description: "Year (e.g., '2024')" },
            quarter: { type: "string", description: "Quarter (e.g., '2')" }
          },
          required: ["ticker", "year", "quarter"]
        }
      },

      // ---------- Filings  ----------
      {
        name: "filings_recent",
        description: "Get recent SEC filings for a company",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            limit: { type: "integer", description: "Number of filings to return" },
            form: { type: "string", description: "Filter by form type (e.g., '10-K')" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "filings_forms",
        description: "Get specific SEC form type filings for a company",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            formType: { type: "string", description: "Form type (e.g., '10-K', '8-K')" },
            year: { type: "string", description: "Filter by year" },
            quarter: { type: "string", description: "Filter by quarter" },
            limit: { type: "integer", description: "Number of filings to return" }
          },
          required: ["ticker", "formType"]
        }
      },
      {
        name: "filings_list_forms",
        description: "List available SEC form types and their descriptions",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "filings_search",
        description: "Search filings by year/quarter",
        inputSchema: {
          type: "object",
          properties: {
            year: { type: "string", description: "Year (e.g., '2024')" },
            quarter: { type: "string", description: "Quarter (e.g., 'Q1')" },
            form: { type: "string", description: "Form type filter" },
            ticker: { type: "string", description: "Ticker filter" }
          },
          required: ["year", "quarter"]
        }
      },
      {
        name: "filings_document_text",
        description: "Get the full text of an SEC filing document by its document ID",
        inputSchema: {
          type: "object",
          properties: {
            documentId: { type: "string", description: "Document ID (base64-encoded URL) from filing results" }
          },
          required: ["documentId"]
        }
      },
      {
        name: "filings_document_sentiment",
        description: "Get sentiment analysis of an SEC filing document",
        inputSchema: {
          type: "object",
          properties: {
            documentId: { type: "string", description: "Document ID (base64-encoded URL) from filing results" }
          },
          required: ["documentId"]
        }
      },

      // ---------- Financials ----------
      {
        name: "financials_revenue",
        description: "Get historical revenue for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            periods: { type: "integer", description: "Number of periods to return" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_net_income",
        description: "Get historical net income for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            periods: { type: "integer", description: "Number of periods" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_total_assets",
        description: "Get historical total assets",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            periods: { type: "integer", description: "Number of periods" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_total_liabilities",
        description: "Get historical total liabilities",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            periods: { type: "integer", description: "Number of periods" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_stockholders_equity",
        description: "Get historical stockholders equity",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            periods: { type: "integer", description: "Number of periods" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_current_assets",
        description: "Get historical current assets",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            periods: { type: "integer", description: "Number of periods" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_current_liabilities",
        description: "Get historical current liabilities",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            periods: { type: "integer", description: "Number of periods" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_operating_cash_flow",
        description: "Get historical operating cash flow",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            periods: { type: "integer", description: "Number of periods" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_capital_expenditures",
        description: "Get historical capital expenditures",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            periods: { type: "integer", description: "Number of periods" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_free_cash_flow",
        description: "Get historical free cash flow",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            periods: { type: "integer", description: "Number of periods" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_shares_outstanding_basic",
        description: "Get historical basic shares outstanding",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            periods: { type: "integer", description: "Number of periods" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_shares_outstanding_diluted",
        description: "Get historical diluted shares outstanding",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            periods: { type: "integer", description: "Number of periods" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_metrics",
        description: "Get calculated financial metrics for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_snapshot",
        description: "Get a snapshot of key financial data",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_dcf_value",
        description: "Get DCF valuation including enterprise value, fair price, margin of safety, and buy/sell recommendation",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_dcf_rate",
        description: "Get discount rate / WACC calculation including cost of equity, cost of debt, and capital structure weights",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_eps",
        description: "Get TTM earnings per share for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            from: { type: "string", description: "Start date (YYYY-MM-DD)" },
            to: { type: "string", description: "End date (YYYY-MM-DD)" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_pe",
        description: "Get price-to-earnings ratio for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            from: { type: "string", description: "Start date (YYYY-MM-DD)" },
            to: { type: "string", description: "End date (YYYY-MM-DD)" },
            frame: { type: "string", description: "Resampling frequency: daily, weekly, monthly" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_market_cap",
        description: "Get market capitalization for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            from: { type: "string", description: "Start date (YYYY-MM-DD)" },
            to: { type: "string", description: "End date (YYYY-MM-DD)" },
            frame: { type: "string", description: "Resampling frequency: daily, weekly, monthly" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_roe",
        description: "Get return on equity for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            from: { type: "string", description: "Start date (YYYY-MM-DD)" },
            to: { type: "string", description: "End date (YYYY-MM-DD)" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_enterprise_value",
        description: "Get enterprise value for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            from: { type: "string", description: "Start date (YYYY-MM-DD)" },
            to: { type: "string", description: "End date (YYYY-MM-DD)" },
            frame: { type: "string", description: "Resampling frequency: daily, weekly, monthly" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_ebitda",
        description: "Get TTM EBITDA for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            from: { type: "string", description: "Start date (YYYY-MM-DD)" },
            to: { type: "string", description: "End date (YYYY-MM-DD)" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_debt_to_equity",
        description: "Get debt-to-equity ratio for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            from: { type: "string", description: "Start date (YYYY-MM-DD)" },
            to: { type: "string", description: "End date (YYYY-MM-DD)" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_balance_sheet",
        description: "Get balance sheet statement for a ticker (optionally by year/quarter)",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            year: { type: "integer", description: "Year (e.g., 2024)" },
            quarter: { type: "integer", description: "Quarter (1-4)" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_income_statement",
        description: "Get income statement for a ticker (optionally by year/quarter)",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            year: { type: "integer", description: "Year (e.g., 2024)" },
            quarter: { type: "integer", description: "Quarter (1-4)" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "financials_cash_flow_statement",
        description: "Get cash flow statement for a ticker (optionally by year/quarter)",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" },
            year: { type: "integer", description: "Year (e.g., 2024)" },
            quarter: { type: "integer", description: "Quarter (1-4)" }
          },
          required: ["ticker"]
        }
      },

      // ---------- Insiders / Ownership ----------
      {
        name: "insiders_funds",
        description: "Get fund ownership data for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "insiders_individuals",
        description: "Get insider holders (individuals) for a ticker",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "insiders_institutions",
        description: "Get institutional ownership data",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "insiders_ownership",
        description: "Get major holders breakdown",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "insiders_activity",
        description: "Get net share purchase activity",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },
      {
        name: "insiders_transactions",
        description: "Get insider transactions",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      },

      // ---------- Web Traffic ----------
      {
        name: "webtraffic_traffic",
        description: "Get website traffic data for a company",
        inputSchema: {
          type: "object",
          properties: {
            ticker: { type: "string", description: "Stock ticker" }
          },
          required: ["ticker"]
        }
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    let endpoint;

    // ---------- Credit ----------
    if (name === "credit_search") {
      endpoint = `credit/search${buildQueryString({ query: args.query })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "credit_ratings") {
      endpoint = `credit/ratings/${args.id}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }

    // ---------- ESG ----------
    else if (name === "esg_data") {
      endpoint = `esg/${args.ticker}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }

    // ---------- ETF (plural endpoints) ----------

    else if (name === "etf_tickers") {
      endpoint = `etfs/tickers${buildQueryString({ country: args.country, exchange: args.exchange })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "etf_gainers") {
      endpoint = `etfs/gainers`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "etf_losers") {
      endpoint = `etfs/losers`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "etf_list_market") {
      endpoint = `etfs/list/market`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "etf_list_country") {
      endpoint = `etfs/list/country`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "etf_list_currency") {
      endpoint = `etfs/list/currency`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "etf_list_sector") {
      endpoint = `etfs/list/sector`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "etf_list_industry") {
      endpoint = `etfs/list/industry`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "etf_list_type") {
      endpoint = `etfs/list/type`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "etf_quote") {
      endpoint = `etfs/${args.ticker}/quote`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "etf_prices") {
      endpoint = `etfs/${args.ticker}/prices${buildQueryString({ from: args.from, to: args.to, frame: args.frame })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "etf_fund") {
      endpoint = `etfs/${args.ticker}/fund`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "etf_holdings") {
      endpoint = `etfs/${args.ticker}/holdings`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "etf_holdings_all") {
      endpoint = `etfs/${args.ticker}/holdings/all`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "etf_exposure") {
      endpoint = `etfs/${args.ticker}/exposure`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "etf_weights") {
      endpoint = `etfs/${args.ticker}/weights`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }


    // ---------- Supply Chain ----------
    else if (name === "supply_chain_customers") {
      endpoint = `supply-chain/${args.ticker}/customers`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "supply_chain_peers") {
      endpoint = `supply-chain/${args.ticker}/peers`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "supply_chain_suppliers") {
      endpoint = `supply-chain/${args.ticker}/suppliers`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }

    // ---------- Stocks ----------
    else if (name === "stocks_tickers") {
      endpoint = `stocks/tickers${buildQueryString({ country: args.country, exchange: args.exchange })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "stocks_gainers") {
      endpoint = `stocks/gainers`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "stocks_losers") {
      endpoint = `stocks/losers`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "stocks_list_market") {
      endpoint = `stocks/list/market`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "stocks_list_country") {
      endpoint = `stocks/list/country`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "stocks_list_currency") {
      endpoint = `stocks/list/currency`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "stocks_list_sector") {
      endpoint = `stocks/list/sector`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "stocks_list_industry") {
      endpoint = `stocks/list/industry`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "stocks_list_type") {
      endpoint = `stocks/list/type`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "stocks_quote") {
      endpoint = `stocks/${args.ticker}/quote`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "stocks_prices") {
      endpoint = `stocks/${args.ticker}/prices${buildQueryString({ from: args.from, to: args.to, frame: args.frame })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }

    // ---------- Crypto ----------
    else if (name === "crypto_tickers") {
      endpoint = `crypto/tickers${buildQueryString({ type: args.type })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "crypto_gainers") {
      endpoint = `crypto/gainers`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "crypto_losers") {
      endpoint = `crypto/losers`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "crypto_list_category") {
      endpoint = `crypto/list/category`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "crypto_list_rating") {
      endpoint = `crypto/list/rating`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "crypto_list_type") {
      endpoint = `crypto/list/type`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "crypto_quote") {
      endpoint = `crypto/${args.ticker}/quote`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "crypto_prices") {
      endpoint = `crypto/${args.ticker}/prices${buildQueryString({ from: args.from, to: args.to, frame: args.frame })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }

    // ---------- Forex ----------
    else if (name === "forex_tickers") {
      endpoint = `forex/tickers${buildQueryString({ country: args.country, exchange: args.exchange })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "forex_gainers") {
      endpoint = `forex/gainers`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "forex_losers") {
      endpoint = `forex/losers`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "forex_list_exchange") {
      endpoint = `forex/list/exchange`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "forex_list_rating") {
      endpoint = `forex/list/rating`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "forex_list_country") {
      endpoint = `forex/list/country`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "forex_quote") {
      endpoint = `forex/${args.ticker}/quote`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "forex_prices") {
      endpoint = `forex/${args.ticker}/prices${buildQueryString({ from: args.from, to: args.to, frame: args.frame })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }

    // ---------- Futures ----------
    else if (name === "futures_tickers") {
      endpoint = `futures/tickers${buildQueryString({ exchange: args.exchange })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "futures_gainers") {
      endpoint = `futures/gainers`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "futures_losers") {
      endpoint = `futures/losers`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "futures_list_exchange") {
      endpoint = `futures/list/exchange`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "futures_list_currency") {
      endpoint = `futures/list/currency`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "futures_list_timezone") {
      endpoint = `futures/list/timezone`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "futures_list_country") {
      endpoint = `futures/list/country`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "futures_quote") {
      endpoint = `futures/${args.ticker}/quote`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "futures_prices") {
      endpoint = `futures/${args.ticker}/prices${buildQueryString({ from: args.from, to: args.to, frame: args.frame })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }

    // ---------- Indices ----------
    else if (name === "indices_tickers") {
      endpoint = `indices/tickers${buildQueryString({ exchange: args.exchange })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "indices_gainers") {
      endpoint = `indices/gainers`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "indices_losers") {
      endpoint = `indices/losers`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "indices_list_exchange") {
      endpoint = `indices/list/exchange`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "indices_list_timezone") {
      endpoint = `indices/list/timezone`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "indices_list_country") {
      endpoint = `indices/list/country`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "indices_quote") {
      endpoint = `indices/${args.ticker}/quote`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "indices_prices") {
      endpoint = `indices/${args.ticker}/prices${buildQueryString({ from: args.from, to: args.to, frame: args.frame })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "indices_components") {
      endpoint = `indices/${args.ticker}/components`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "indices_exposure") {
      endpoint = `indices/${args.ticker}/exposure`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }

    // ---------- Economics ----------
    else if (name === "econ_search") {
      endpoint = `econ/search${buildQueryString({ query: args.query })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "econ_dataset") {
      endpoint = `econ/dataset/${args.id}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "econ_calendar") {
      endpoint = `econ/calendar${buildQueryString({
        from: args.from,
        to: args.to,
        country: args.country,
        minImportance: args.minImportance,
        currency: args.currency,
        category: args.category,
        limit: args.limit
      })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "econ_find") {
      endpoint = `econ/find${buildQueryString({ query: args.query })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }

    // ---------- News ----------
    else if (name === "news_general") {
      endpoint = `news`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "news_ticker") {
      endpoint = `news/${args.ticker}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "news_country") {
      endpoint = `news/country/${encodeURIComponent(args.country)}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "news_category") {
      endpoint = `news/category/${encodeURIComponent(args.category)}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "news_article") {
      endpoint = `news/article/${args.id}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }

    // ---------- Sentiment ----------
    else if (name === "sentiment_all") {
      endpoint = `sentiment/${args.ticker}/all`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "sentiment_social") {
      endpoint = `sentiment/${args.ticker}/social`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "sentiment_news") {
      endpoint = `sentiment/${args.ticker}/news`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "sentiment_analyst") {
      endpoint = `sentiment/${args.ticker}/analyst`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }

    // ---------- Profiles ----------
    else if (name === "profiles_profile") {
      endpoint = `profiles/${args.ticker}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "profiles_recommendation") {
      endpoint = `profiles/${args.ticker}/recommendation`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "profiles_statistics") {
      endpoint = `profiles/${args.ticker}/statistics`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "profiles_summary") {
      endpoint = `profiles/${args.ticker}/summary`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "profiles_calendar") {
      endpoint = `profiles/${args.ticker}/calendar`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "profiles_info") {
      endpoint = `profiles/${args.ticker}/info`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }

    // ---------- Earnings ----------
    else if (name === "earnings_history") {
      endpoint = `earnings/${args.ticker}/history`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "earnings_trend") {
      endpoint = `earnings/${args.ticker}/trend`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "earnings_index") {
      endpoint = `earnings/${args.ticker}/index`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "earnings_report") {
      endpoint = `earnings/${args.ticker}/report${buildQueryString({ year: args.year, quarter: args.quarter })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "earnings_transcript") {
      endpoint = `earnings/${args.ticker}/transcript${buildQueryString({ year: args.year, quarter: args.quarter })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "earnings_transcript_sentiment") {
      const id = btoa(JSON.stringify({ ticker: args.ticker, year: args.year, quarter: args.quarter }));
      endpoint = `earnings/transcript/sentiment${buildQueryString({ id })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }

    // ---------- Filings ----------
    else if (name === "filings_recent") {
      endpoint = `filings/${args.ticker}${buildQueryString({ limit: args.limit, form: args.form })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "filings_forms") {
      endpoint = `filings/${args.ticker}/forms/${args.formType}${buildQueryString({ year: args.year, quarter: args.quarter, limit: args.limit })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "filings_list_forms") {
      endpoint = `filings/list/forms`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "filings_search") {
      endpoint = `filings/search${buildQueryString({ year: args.year, quarter: args.quarter, form: args.form, ticker: args.ticker })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "filings_document_text") {
      endpoint = `filings/document/text${buildQueryString({ documentId: args.documentId })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "filings_document_sentiment") {
      endpoint = `filings/document/sentiment${buildQueryString({ documentId: args.documentId })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }

    // ---------- Financials ----------
    else if (name === "financials_revenue") {
      endpoint = `financials/${args.ticker}/revenue${buildQueryString({ periods: args.periods })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_net_income") {
      endpoint = `financials/${args.ticker}/netincome${buildQueryString({ periods: args.periods })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_total_assets") {
      endpoint = `financials/${args.ticker}/total/assets${buildQueryString({ periods: args.periods })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_total_liabilities") {
      endpoint = `financials/${args.ticker}/total/liabilities${buildQueryString({ periods: args.periods })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_stockholders_equity") {
      endpoint = `financials/${args.ticker}/stockholdersequity${buildQueryString({ periods: args.periods })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_current_assets") {
      endpoint = `financials/${args.ticker}/current/assets${buildQueryString({ periods: args.periods })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_current_liabilities") {
      endpoint = `financials/${args.ticker}/current/liabilities${buildQueryString({ periods: args.periods })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_operating_cash_flow") {
      endpoint = `financials/${args.ticker}/cashflow/operating${buildQueryString({ periods: args.periods })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_capital_expenditures") {
      endpoint = `financials/${args.ticker}/capitalexpenditures${buildQueryString({ periods: args.periods })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_free_cash_flow") {
      endpoint = `financials/${args.ticker}/cashflow/free${buildQueryString({ periods: args.periods })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_shares_outstanding_basic") {
      endpoint = `financials/${args.ticker}/sharesoutstanding/basic${buildQueryString({ periods: args.periods })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_shares_outstanding_diluted") {
      endpoint = `financials/${args.ticker}/sharesoutstanding/diluted${buildQueryString({ periods: args.periods })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_metrics") {
      endpoint = `financials/${args.ticker}/metrics`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_snapshot") {
      endpoint = `financials/${args.ticker}/snapshot`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_dcf_value") {
      endpoint = `financials/dcf/${args.ticker}/value`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_dcf_rate") {
      endpoint = `financials/dcf/${args.ticker}/rate`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_balance_sheet") {
      endpoint = `financials/statements/${args.ticker}/balance${buildQueryString({ year: args.year, quarter: args.quarter })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_income_statement") {
      endpoint = `financials/statements/${args.ticker}/income${buildQueryString({ year: args.year, quarter: args.quarter })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_cash_flow_statement") {
      endpoint = `financials/statements/${args.ticker}/cashflow${buildQueryString({ year: args.year, quarter: args.quarter })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_eps") {
      endpoint = `financials/${args.ticker}/eps${buildQueryString({ from: args.from, to: args.to })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_pe") {
      endpoint = `financials/${args.ticker}/pe${buildQueryString({ from: args.from, to: args.to, frame: args.frame })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_market_cap") {
      endpoint = `financials/${args.ticker}/marketcap${buildQueryString({ from: args.from, to: args.to, frame: args.frame })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_roe") {
      endpoint = `financials/${args.ticker}/roe${buildQueryString({ from: args.from, to: args.to })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_enterprise_value") {
      endpoint = `financials/${args.ticker}/ev${buildQueryString({ from: args.from, to: args.to, frame: args.frame })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_ebitda") {
      endpoint = `financials/${args.ticker}/ebitda${buildQueryString({ from: args.from, to: args.to })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "financials_debt_to_equity") {
      endpoint = `financials/${args.ticker}/de${buildQueryString({ from: args.from, to: args.to })}`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }

    // ---------- Insiders ----------
    else if (name === "insiders_funds") {
      endpoint = `insiders/${args.ticker}/funds`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "insiders_individuals") {
      endpoint = `insiders/${args.ticker}/individuals`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "insiders_institutions") {
      endpoint = `insiders/${args.ticker}/institutions`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "insiders_ownership") {
      endpoint = `insiders/${args.ticker}/ownership`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "insiders_activity") {
      endpoint = `insiders/${args.ticker}/activity`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }
    else if (name === "insiders_transactions") {
      endpoint = `insiders/${args.ticker}/transactions`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }

    // ---------- Web Traffic ----------
    else if (name === "webtraffic_traffic") {
      endpoint = `webtraffic/${args.ticker}/traffic`;
      result = await makeApiRequest(endpoint, { method: 'GET' });
    }

    else {
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
  console.error("Axion MCP Server v2 running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
