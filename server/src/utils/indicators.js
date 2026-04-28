/**
 * Technical indicator calculations for the AI agent's analysis
 */

/**
 * Simple Moving Average
 */
export function sma(data, period) {
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const avg = slice.reduce((sum, d) => sum + d.close, 0) / period;
    result.push({ date: data[i].date, value: parseFloat(avg.toFixed(2)) });
  }
  return result;
}

/**
 * Exponential Moving Average
 */
export function ema(data, period) {
  const result = [];
  const multiplier = 2 / (period + 1);

  // Start with SMA for the first value
  let prevEma =
    data.slice(0, period).reduce((sum, d) => sum + d.close, 0) / period;
  result.push({
    date: data[period - 1].date,
    value: parseFloat(prevEma.toFixed(2)),
  });

  for (let i = period; i < data.length; i++) {
    const currentEma = (data[i].close - prevEma) * multiplier + prevEma;
    result.push({
      date: data[i].date,
      value: parseFloat(currentEma.toFixed(2)),
    });
    prevEma = currentEma;
  }
  return result;
}

/**
 * Relative Strength Index (RSI)
 */
export function rsi(data, period = 14) {
  if (data.length < period + 1) return [];

  const changes = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close);
  }

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) avgGain += changes[i];
    else avgLoss += Math.abs(changes[i]);
  }
  avgGain /= period;
  avgLoss /= period;

  const result = [];
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push({
    date: data[period].date,
    value: parseFloat((100 - 100 / (1 + rs)).toFixed(2)),
  });

  for (let i = period; i < changes.length; i++) {
    const gain = changes[i] > 0 ? changes[i] : 0;
    const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push({
      date: data[i + 1].date,
      value: parseFloat((100 - 100 / (1 + rs)).toFixed(2)),
    });
  }
  return result;
}

/**
 * MACD (Moving Average Convergence Divergence)
 */
export function macd(data) {
  const ema12 = ema(data, 12);
  const ema26 = ema(data, 26);

  if (ema26.length === 0) return { macdLine: [], signalLine: [], histogram: [] };

  const macdLine = [];
  const ema26Dates = new Set(ema26.map((d) => d.date));

  for (const e12 of ema12) {
    if (ema26Dates.has(e12.date)) {
      const e26 = ema26.find((d) => d.date === e12.date);
      macdLine.push({
        date: e12.date,
        value: parseFloat((e12.value - e26.value).toFixed(2)),
      });
    }
  }

  // Signal line = 9-period EMA of MACD line
  const signalLine = [];
  if (macdLine.length >= 9) {
    const multiplier = 2 / (9 + 1);
    let prevEma =
      macdLine.slice(0, 9).reduce((sum, d) => sum + d.value, 0) / 9;
    signalLine.push({
      date: macdLine[8].date,
      value: parseFloat(prevEma.toFixed(2)),
    });
    for (let i = 9; i < macdLine.length; i++) {
      const currentEma =
        (macdLine[i].value - prevEma) * multiplier + prevEma;
      signalLine.push({
        date: macdLine[i].date,
        value: parseFloat(currentEma.toFixed(2)),
      });
      prevEma = currentEma;
    }
  }

  const histogram = [];
  const signalDates = new Map(signalLine.map((d) => [d.date, d.value]));
  for (const m of macdLine) {
    if (signalDates.has(m.date)) {
      histogram.push({
        date: m.date,
        value: parseFloat((m.value - signalDates.get(m.date)).toFixed(2)),
      });
    }
  }

  return { macdLine, signalLine, histogram };
}

/**
 * Bollinger Bands
 */
export function bollingerBands(data, period = 20, stdDev = 2) {
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((sum, d) => sum + d.close, 0) / period;
    const variance =
      slice.reduce((sum, d) => sum + Math.pow(d.close - mean, 2), 0) / period;
    const sd = Math.sqrt(variance);

    result.push({
      date: data[i].date,
      upper: parseFloat((mean + stdDev * sd).toFixed(2)),
      middle: parseFloat(mean.toFixed(2)),
      lower: parseFloat((mean - stdDev * sd).toFixed(2)),
    });
  }
  return result;
}

/**
 * Generate a full technical analysis summary object
 */
export function generateTechnicalSummary(historicalData) {
  const sma5 = sma(historicalData, 5);
  const sma20 = sma(historicalData, 20);
  const rsiValues = rsi(historicalData, 14);
  const macdData = macd(historicalData);
  const bbands = bollingerBands(historicalData, 20, 2);

  const latestClose = historicalData[historicalData.length - 1]?.close;
  const latestRSI = rsiValues[rsiValues.length - 1]?.value;
  const latestMACD = macdData.macdLine[macdData.macdLine.length - 1]?.value;
  const latestSignal =
    macdData.signalLine[macdData.signalLine.length - 1]?.value;
  const latestBB = bbands[bbands.length - 1];
  const latestSMA5 = sma5[sma5.length - 1]?.value;
  const latestSMA20 = sma20[sma20.length - 1]?.value;

  // Price change over different periods
  const priceChange1d =
    historicalData.length >= 2
      ? (
          ((latestClose - historicalData[historicalData.length - 2].close) /
            historicalData[historicalData.length - 2].close) *
          100
        ).toFixed(2)
      : 0;

  const priceChange5d =
    historicalData.length >= 6
      ? (
          ((latestClose - historicalData[historicalData.length - 6].close) /
            historicalData[historicalData.length - 6].close) *
          100
        ).toFixed(2)
      : 0;

  const priceChange15d =
    historicalData.length >= 16
      ? (
          ((latestClose - historicalData[historicalData.length - 16].close) /
            historicalData[historicalData.length - 16].close) *
          100
        ).toFixed(2)
      : 0;

  // Volume trend
  const recentVolumes = historicalData.slice(-5).map((d) => d.volume);
  const avgRecentVol =
    recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
  const olderVolumes = historicalData
    .slice(-15, -5)
    .map((d) => d.volume);
  const avgOlderVol =
    olderVolumes.length > 0
      ? olderVolumes.reduce((a, b) => a + b, 0) / olderVolumes.length
      : avgRecentVol;
  const volumeTrend =
    avgRecentVol > avgOlderVol * 1.2
      ? "Increasing"
      : avgRecentVol < avgOlderVol * 0.8
        ? "Decreasing"
        : "Stable";

  return {
    latestClose,
    sma5: latestSMA5,
    sma20: latestSMA20,
    rsi: latestRSI,
    macd: latestMACD,
    macdSignal: latestSignal,
    macdHistogram:
      macdData.histogram[macdData.histogram.length - 1]?.value,
    bollingerUpper: latestBB?.upper,
    bollingerMiddle: latestBB?.middle,
    bollingerLower: latestBB?.lower,
    priceChange1d: parseFloat(priceChange1d),
    priceChange5d: parseFloat(priceChange5d),
    priceChange15d: parseFloat(priceChange15d),
    volumeTrend,
    sma5Series: sma5,
    sma20Series: sma20,
    rsiSeries: rsiValues,
    macdSeries: macdData,
    bollingerSeries: bbands,
  };
}
