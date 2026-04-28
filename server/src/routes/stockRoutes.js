import express from "express";
import {
  getStockQuote,
  getHistoricalData,
} from "../services/stockService.js";
import { analyzeStock } from "../services/aiAgent.js";
import { generateTechnicalSummary } from "../utils/indicators.js";

const router = express.Router();

/**
 * GET /api/stock/analyze?symbol=AAPL
 * Main endpoint — fetches everything and returns a full dashboard payload
 */
router.get("/analyze", async (req, res) => {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: "Symbol query parameter is required" });
  }

  const ticker = symbol.toUpperCase().trim();

  try {
    // Step 1: Fetch quote + historical data in parallel
    const [quoteData, historicalData] = await Promise.all([
      getStockQuote(ticker),
      getHistoricalData(ticker, 45), // 45 days to have enough data for indicators
    ]);

    if (!quoteData.quote || !quoteData.quote.regularMarketPrice) {
      return res.status(404).json({ error: `Stock "${ticker}" not found` });
    }

    // Step 2: Calculate technical indicators
    const technicalSummary = generateTechnicalSummary(historicalData);

    // Step 3: AI Agent analysis
    const aiAnalysis = await analyzeStock(ticker, quoteData, technicalSummary);

    // Step 4: Build response
    const { quote, summaryDetail } = quoteData;
    const fd = summaryDetail?.financialData || {};
    const sd = summaryDetail?.summaryDetail || {};
    const ks = summaryDetail?.defaultKeyStatistics || {};

    // Last 15 trading days for the trend chart
    const last15Days = historicalData.slice(-15);

    res.json({
      symbol: ticker,
      companyName: quote.shortName || quote.longName || ticker,
      exchange: quote.fullExchangeName || quote.exchange,

      price: {
        current: quote.regularMarketPrice,
        previousClose: quote.regularMarketPreviousClose,
        open: quote.regularMarketOpen,
        dayHigh: quote.regularMarketDayHigh,
        dayLow: quote.regularMarketDayLow,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
      },

      fundamentals: {
        marketCap: quote.marketCap,
        peRatio: sd.trailingPE || quote.trailingPE,
        forwardPE: sd.forwardPE || quote.forwardPE,
        pegRatio: ks.pegRatio,
        priceToBook: sd.priceToBook || ks.priceToBook,
        eps: quote.epsTrailingTwelveMonths,
        epsForward: quote.epsForward,
        dividendYield: sd.dividendYield || quote.dividendYield,
        profitMargin: fd.profitMargins,
        revenueGrowth: fd.revenueGrowth,
        earningsGrowth: fd.earningsGrowth,
        debtToEquity: fd.debtToEquity,
        returnOnEquity: fd.returnOnEquity,
        currentRatio: fd.currentRatio,
        beta: ks.beta || quote.beta,
        targetMeanPrice: fd.targetMeanPrice,
        analystRecommendation: fd.recommendationKey,
        averageVolume: quote.averageDailyVolume3Month,
      },

      historical: last15Days,

      technicalIndicators: {
        sma5: technicalSummary.sma5Series.slice(-15),
        sma20: technicalSummary.sma20Series.slice(-15),
        rsi: technicalSummary.rsiSeries.slice(-15),
        macd: {
          macdLine: technicalSummary.macdSeries.macdLine.slice(-15),
          signalLine: technicalSummary.macdSeries.signalLine.slice(-15),
          histogram: technicalSummary.macdSeries.histogram.slice(-15),
        },
        bollinger: technicalSummary.bollingerSeries.slice(-15),
        currentValues: {
          rsi: technicalSummary.rsi,
          macd: technicalSummary.macd,
          sma5: technicalSummary.sma5,
          sma20: technicalSummary.sma20,
          volumeTrend: technicalSummary.volumeTrend,
        },
      },

      aiAnalysis,
    });
  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({
      error: "Failed to analyze stock",
      details: err.message,
    });
  }
});

export default router;
