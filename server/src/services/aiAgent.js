import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Groq fallback — free tier: 30 req/min, 14400 req/day
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// Gemini models to try in order
const GEMINI_MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

/**
 * Try Gemini models with retry, then fall back to Groq
 */
async function callAI(prompt) {
  // ---- Attempt Gemini ----
  for (const modelName of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`AI Agent: trying Gemini ${modelName} (attempt ${attempt}/2)...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        console.log(`AI Agent: Gemini ${modelName} responded successfully.`);
        return text;
      } catch (err) {
        const isRateLimit =
          err.status === 429 ||
          err.status === 404 ||
          err.message?.includes("429") ||
          err.message?.includes("quota");
        if (isRateLimit && attempt < 2) {
          console.log(`AI Agent: ${modelName} rate-limited. Retrying in 3s...`);
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }
        if (isRateLimit) {
          console.log(`AI Agent: ${modelName} exhausted. Trying next...`);
          break;
        }
        throw err;
      }
    }
  }

  // ---- Fallback to Groq ----
  if (groq) {
    console.log("AI Agent: Gemini quota exhausted. Falling back to Groq (llama-3.3-70b)...");
    try {
      const chat = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2048,
      });
      const text = chat.choices[0]?.message?.content?.trim();
      console.log("AI Agent: Groq responded successfully.");
      return text;
    } catch (err) {
      console.error("AI Agent: Groq also failed:", err.message);
    }
  }

  throw new Error(
    "All AI providers are unavailable. Add a GROQ_API_KEY in .env as backup (free at https://console.groq.com)."
  );
}

// ============================================================
// Build the analysis prompt (shared by all providers)
// ============================================================
function buildPrompt(symbol, quoteData, technicalSummary) {
  const { quote, summaryDetail } = quoteData;
  const fd = summaryDetail?.financialData || {};
  const sd = summaryDetail?.summaryDetail || {};
  const ks = summaryDetail?.defaultKeyStatistics || {};

  return `
You are an expert agentic AI stock analyst. You must analyze the stock "${symbol}" and provide a comprehensive investment recommendation.

=== CURRENT MARKET DATA ===
- Current Price: $${quote.regularMarketPrice}
- Previous Close: $${quote.regularMarketPreviousClose}
- Day Range: $${quote.regularMarketDayLow} - $${quote.regularMarketDayHigh}
- 52-Week Range: $${quote.fiftyTwoWeekLow} - $${quote.fiftyTwoWeekHigh}
- Market Cap: ${quote.marketCap ? "$" + (quote.marketCap / 1e9).toFixed(2) + "B" : "N/A"}
- Average Volume: ${quote.averageDailyVolume3Month || "N/A"}

=== FUNDAMENTAL DATA ===
- P/E Ratio (Trailing): ${sd.trailingPE || quote.trailingPE || "N/A"}
- P/E Ratio (Forward): ${sd.forwardPE || quote.forwardPE || "N/A"}
- PEG Ratio: ${ks.pegRatio || "N/A"}
- Price/Book: ${sd.priceToBook || ks.priceToBook || "N/A"}
- Dividend Yield: ${sd.dividendYield ? (sd.dividendYield * 100).toFixed(2) + "%" : quote.dividendYield ? (quote.dividendYield).toFixed(2) + "%" : "N/A"}
- Profit Margins: ${fd.profitMargins ? (fd.profitMargins * 100).toFixed(2) + "%" : "N/A"}
- Revenue Growth: ${fd.revenueGrowth ? (fd.revenueGrowth * 100).toFixed(2) + "%" : "N/A"}
- Earnings Growth: ${fd.earningsGrowth ? (fd.earningsGrowth * 100).toFixed(2) + "%" : "N/A"}
- Debt/Equity: ${fd.debtToEquity || "N/A"}
- Return on Equity: ${fd.returnOnEquity ? (fd.returnOnEquity * 100).toFixed(2) + "%" : "N/A"}
- Current Ratio: ${fd.currentRatio || "N/A"}
- Target Mean Price: ${fd.targetMeanPrice ? "$" + fd.targetMeanPrice : "N/A"}
- Analyst Recommendation: ${fd.recommendationKey || "N/A"}
- Beta: ${ks.beta || quote.beta || "N/A"}
- EPS (Trailing): ${quote.epsTrailingTwelveMonths || "N/A"}
- EPS (Forward): ${quote.epsForward || "N/A"}

=== TECHNICAL INDICATORS ===
- SMA(5): ${technicalSummary.sma5 || "N/A"}
- SMA(20): ${technicalSummary.sma20 || "N/A"}
- RSI(14): ${technicalSummary.rsi || "N/A"}
- MACD: ${technicalSummary.macd || "N/A"}
- MACD Signal: ${technicalSummary.macdSignal || "N/A"}
- MACD Histogram: ${technicalSummary.macdHistogram || "N/A"}
- Bollinger Upper: ${technicalSummary.bollingerUpper || "N/A"}
- Bollinger Middle: ${technicalSummary.bollingerMiddle || "N/A"}
- Bollinger Lower: ${technicalSummary.bollingerLower || "N/A"}
- 1-Day Price Change: ${technicalSummary.priceChange1d}%
- 5-Day Price Change: ${technicalSummary.priceChange5d}%
- 15-Day Price Change: ${technicalSummary.priceChange15d}%
- Volume Trend: ${technicalSummary.volumeTrend}

=== INSTRUCTIONS ===
You must respond in EXACTLY this JSON format (no markdown, no code fences, just raw JSON):
{
  "recommendation": "STRONG BUY" | "BUY" | "HOLD" | "SELL" | "STRONG SELL",
  "confidence": <number 0-100>,
  "targetPrice": <number>,
  "stopLoss": <number>,
  "riskLevel": "Low" | "Medium" | "High" | "Very High",
  "fundamentalScore": <number 0-100>,
  "technicalScore": <number 0-100>,
  "overallScore": <number 0-100>,
  "reasons": [
    "<reason 1 — be specific with data>",
    "<reason 2>",
    "<reason 3>",
    "<reason 4>",
    "<reason 5>"
  ],
  "fundamentalAnalysis": "<2-3 sentence fundamental analysis>",
  "technicalAnalysis": "<2-3 sentence technical analysis>",
  "riskAnalysis": "<2-3 sentence risk analysis>",
  "summary": "<3-4 sentence overall summary with clear actionable advice>"
}

Be data-driven. Reference specific numbers. Give honest, unbiased analysis.
If the stock looks bad, say so clearly. Do not sugarcoat.
`;
}

/**
 * Main export — Agentic AI stock analysis
 */
export async function analyzeStock(symbol, quoteData, technicalSummary) {
  const prompt = buildPrompt(symbol, quoteData, technicalSummary);

  let text = await callAI(prompt);

  // Strip markdown code fences if present
  text = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

  try {
    return JSON.parse(text);
  } catch {
    return {
      recommendation: "HOLD",
      confidence: 50,
      targetPrice: null,
      stopLoss: null,
      riskLevel: "Medium",
      fundamentalScore: 50,
      technicalScore: 50,
      overallScore: 50,
      reasons: ["AI analysis could not be fully parsed. Please retry."],
      fundamentalAnalysis: text.slice(0, 300),
      technicalAnalysis: "",
      riskAnalysis: "",
      summary: text.slice(0, 500),
    };
  }
}
