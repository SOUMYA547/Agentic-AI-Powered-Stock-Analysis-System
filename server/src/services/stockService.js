/**
 * Stock data service using Yahoo Finance v8 API directly (no broken npm libs).
 * Uses the public chart + quoteSummary JSON endpoints.
 */

const BASE = "https://query1.finance.yahoo.com";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

/**
 * Fetch current quote using the v8 chart endpoint (1d range, 1d interval gives latest price).
 * Then fetch quoteSummary for fundamentals.
 */
export async function getStockQuote(symbol) {
  // --- Quote via v8 finance/quote ---
  const quoteUrl = `${BASE}/v6/finance/quote?symbols=${encodeURIComponent(symbol)}`;
  let quote = {};
  try {
    const res = await fetch(quoteUrl, { headers: HEADERS });
    const json = await res.json();
    quote = json?.quoteResponse?.result?.[0] || {};
  } catch {
    // fallback: try extracting from chart
  }

  // If v6 quote failed (Yahoo sometimes blocks it), extract from chart
  if (!quote.regularMarketPrice) {
    const chartUrl = `${BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`;
    const res = await fetch(chartUrl, { headers: HEADERS });
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (meta) {
      quote = {
        symbol: meta.symbol,
        shortName: meta.shortName || meta.symbol,
        longName: meta.longName || meta.shortName || meta.symbol,
        regularMarketPrice: meta.regularMarketPrice,
        regularMarketPreviousClose: meta.previousClose || meta.chartPreviousClose,
        regularMarketOpen: meta.regularMarketOpen,
        regularMarketDayHigh: meta.regularMarketDayHigh,
        regularMarketDayLow: meta.regularMarketDayLow,
        regularMarketChange:
          meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose || 0),
        regularMarketChangePercent:
          ((meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose || 0)) /
            (meta.previousClose || meta.chartPreviousClose || 1)) *
          100,
        fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
        marketCap: null,
        fullExchangeName: meta.exchangeName,
        exchange: meta.exchangeName,
      };
    }
  }

  // --- Fundamentals via quoteSummary ---
  let summaryDetail = {};
  try {
    const modules = [
      "summaryDetail",
      "defaultKeyStatistics",
      "financialData",
    ].join(",");
    const summaryUrl = `${BASE}/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules}`;
    const res = await fetch(summaryUrl, { headers: HEADERS });
    const json = await res.json();
    const result = json?.quoteSummary?.result?.[0] || {};

    // Yahoo returns nested {raw, fmt} objects — extract raw values
    const extract = (obj) => {
      if (!obj || typeof obj !== "object") return obj;
      if ("raw" in obj) return obj.raw;
      const out = {};
      for (const [k, v] of Object.entries(obj)) {
        out[k] = typeof v === "object" && v !== null && "raw" in v ? v.raw : v;
      }
      return out;
    };

    summaryDetail = {
      summaryDetail: extract(result.summaryDetail),
      defaultKeyStatistics: extract(result.defaultKeyStatistics),
      financialData: extract(result.financialData),
    };
  } catch {
    // Not all tickers have fundamentals
  }

  return { quote, summaryDetail };
}

/**
 * Fetch historical daily candles for the last N days using v8 chart API
 */
export async function getHistoricalData(symbol, days = 45) {
  const period2 = Math.floor(Date.now() / 1000);
  const period1 = period2 - days * 24 * 60 * 60;

  const url = `${BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=1d`;
  const res = await fetch(url, { headers: HEADERS });
  const json = await res.json();

  const result = json?.chart?.result?.[0];
  if (!result) throw new Error(`No historical data found for ${symbol}`);

  const timestamps = result.timestamp || [];
  const ohlcv = result.indicators?.quote?.[0] || {};

  return timestamps.map((ts, i) => ({
    date: new Date(ts * 1000).toISOString().split("T")[0],
    open: ohlcv.open?.[i] ?? 0,
    high: ohlcv.high?.[i] ?? 0,
    low: ohlcv.low?.[i] ?? 0,
    close: ohlcv.close?.[i] ?? 0,
    volume: ohlcv.volume?.[i] ?? 0,
  })).filter((d) => d.close > 0); // filter out any null candles
}
