import { DollarSign } from 'lucide-react';

function fmt(val, opts = {}) {
  if (val === null || val === undefined) return 'N/A';
  if (opts.pct) return (val * 100).toFixed(2) + '%';
  if (opts.money) {
    if (val >= 1e12) return '$' + (val / 1e12).toFixed(2) + 'T';
    if (val >= 1e9) return '$' + (val / 1e9).toFixed(2) + 'B';
    if (val >= 1e6) return '$' + (val / 1e6).toFixed(2) + 'M';
    return '$' + val.toFixed(2);
  }
  if (opts.num) return typeof val === 'number' ? val.toFixed(2) : val;
  if (opts.vol) {
    if (val >= 1e6) return (val / 1e6).toFixed(1) + 'M';
    if (val >= 1e3) return (val / 1e3).toFixed(1) + 'K';
    return val;
  }
  return val;
}

export default function FundamentalsCard({ fundamentals }) {
  const f = fundamentals || {};

  const items = [
    { label: 'Market Cap', value: fmt(f.marketCap, { money: true }) },
    { label: 'P/E Ratio', value: fmt(f.peRatio, { num: true }) },
    { label: 'Forward P/E', value: fmt(f.forwardPE, { num: true }) },
    { label: 'PEG Ratio', value: fmt(f.pegRatio, { num: true }) },
    { label: 'Price/Book', value: fmt(f.priceToBook, { num: true }) },
    { label: 'EPS (TTM)', value: fmt(f.eps, { num: true }) },
    { label: 'EPS (Fwd)', value: fmt(f.epsForward, { num: true }) },
    { label: 'Dividend Yield', value: f.dividendYield ? (f.dividendYield * 100).toFixed(2) + '%' : 'N/A' },
    { label: 'Profit Margin', value: fmt(f.profitMargin, { pct: true }) },
    { label: 'Revenue Growth', value: fmt(f.revenueGrowth, { pct: true }) },
    { label: 'Earnings Growth', value: fmt(f.earningsGrowth, { pct: true }) },
    { label: 'Debt/Equity', value: fmt(f.debtToEquity, { num: true }) },
    { label: 'ROE', value: fmt(f.returnOnEquity, { pct: true }) },
    { label: 'Current Ratio', value: fmt(f.currentRatio, { num: true }) },
    { label: 'Beta', value: fmt(f.beta, { num: true }) },
    { label: 'Avg Volume', value: fmt(f.averageVolume, { vol: true }) },
    { label: 'Target Price', value: f.targetMeanPrice ? '$' + f.targetMeanPrice : 'N/A' },
    { label: 'Analyst Rating', value: f.analystRecommendation || 'N/A' },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3><DollarSign size={16} /> Fundamental Data</h3>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        <div className="fundamentals-grid">
          {items.map((item, i) => (
            <div key={i} className="fundamental-item">
              <span className="f-label">{item.label}</span>
              <span className="f-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
