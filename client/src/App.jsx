import { useState, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import PriceHeader from './components/PriceHeader';
import RecommendationCard from './components/RecommendationCard';
import ScoresCard from './components/ScoresCard';
import TrendChart from './components/TrendChart';
import AnalyzerChart from './components/AnalyzerChart';
import FundamentalsCard from './components/FundamentalsCard';
import ReasonsCard from './components/ReasonsCard';
import AnalysisCard from './components/AnalysisCard';
import SummaryCard from './components/SummaryCard';
import { Search, AlertCircle, TrendingUp } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const analyzeStock = useCallback(async (symbol) => {
    setLoading(true);
    setError(null);
    setData(null);
    setLoadingStep(1);

    try {
      const timer2 = setTimeout(() => setLoadingStep(2), 1500);
      const timer3 = setTimeout(() => setLoadingStep(3), 4000);
      const timer4 = setTimeout(() => setLoadingStep(4), 7000);

      const res = await fetch(`${API_BASE}/stock/analyze?symbol=${encodeURIComponent(symbol)}`);
      
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze stock');
      }
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  }, []);

  return (
    <div className="app">
      <Header />
      <SearchBar onSearch={analyzeStock} loading={loading} />

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner" />
          <h2>AI Agent Analyzing...</h2>
          <div className="loading-steps">
            <div className={`loading-step ${loadingStep >= 1 ? (loadingStep > 1 ? 'done' : 'active') : ''}`}>
              {loadingStep > 1 ? '✓' : '○'} Fetching market data...
            </div>
            <div className={`loading-step ${loadingStep >= 2 ? (loadingStep > 2 ? 'done' : 'active') : ''}`}>
              {loadingStep > 2 ? '✓' : '○'} Computing technical indicators...
            </div>
            <div className={`loading-step ${loadingStep >= 3 ? (loadingStep > 3 ? 'done' : 'active') : ''}`}>
              {loadingStep > 3 ? '✓' : '○'} Running fundamental analysis...
            </div>
            <div className={`loading-step ${loadingStep >= 4 ? 'active' : ''}`}>
              ○ AI generating recommendation...
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-container">
          <AlertCircle size={40} />
          <h3>Analysis Failed</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && !data && (
        <div className="empty-state">
          <div className="empty-icon">
            <TrendingUp size={36} color="#3b82f6" />
          </div>
          <h2>Agentic AI Stock Analyzer</h2>
          <p>
            Enter any stock ticker symbol to get AI-powered fundamental analysis,
            technical indicators, 15-day trend charts, and a clear buy/sell recommendation
            with strong reasons.
          </p>
          <div className="example-tickers">
            {['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'NVDA', 'AMZN', 'META'].map(t => (
              <button key={t} onClick={() => analyzeStock(t)}>{t}</button>
            ))}
          </div>
        </div>
      )}

      {data && (
        <div className="dashboard">
          <div className="dashboard-grid">
            {/* Row 1: Price Header (full width) */}
            <div className="full-width">
              <PriceHeader data={data} />
            </div>

            {/* Row 2: Recommendation + Scores */}
            <RecommendationCard analysis={data.aiAnalysis} />
            <ScoresCard analysis={data.aiAnalysis} />

            {/* Row 3: 15-Day Trend Chart (full width) */}
            <div className="full-width">
              <TrendChart historical={data.historical} indicators={data.technicalIndicators} />
            </div>

            {/* Row 4: Analyzer Chart + Fundamentals */}
            <AnalyzerChart indicators={data.technicalIndicators} />
            <FundamentalsCard fundamentals={data.fundamentals} />

            {/* Row 5: Reasons (full width) */}
            <div className="full-width">
              <ReasonsCard reasons={data.aiAnalysis.reasons} />
            </div>

            {/* Row 6: AI Analysis + Summary */}
            <AnalysisCard analysis={data.aiAnalysis} />
            <SummaryCard analysis={data.aiAnalysis} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
