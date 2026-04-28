import { ThumbsUp, ThumbsDown, Minus, Target, ShieldAlert } from 'lucide-react';

function getRecommendationStyle(rec) {
  const r = (rec || '').toUpperCase();
  if (r.includes('STRONG BUY') || r === 'BUY') return 'buy';
  if (r.includes('STRONG SELL') || r === 'SELL') return 'sell';
  return 'hold';
}

function getRecommendationIcon(rec) {
  const r = (rec || '').toUpperCase();
  if (r.includes('BUY')) return <ThumbsUp size={28} />;
  if (r.includes('SELL')) return <ThumbsDown size={28} />;
  return <Minus size={28} />;
}

export default function RecommendationCard({ analysis }) {
  const style = getRecommendationStyle(analysis.recommendation);
  const barColor =
    style === 'buy' ? 'var(--accent-green)' :
    style === 'sell' ? 'var(--accent-red)' :
    'var(--accent-yellow)';

  return (
    <div className="card">
      <div className="card-header">
        <h3><Target size={16} /> AI Recommendation</h3>
        <span className={`risk-badge ${analysis.riskLevel}`}>
          <ShieldAlert size={12} />
          {analysis.riskLevel} Risk
        </span>
      </div>
      <div className="card-body recommendation-card">
        <div className={`recommendation-badge ${style}`}>
          {getRecommendationIcon(analysis.recommendation)}
          {analysis.recommendation}
        </div>

        <div className="confidence-bar-container">
          <div className="confidence-bar-label">
            <span>Confidence</span>
            <span>{analysis.confidence}%</span>
          </div>
          <div className="confidence-bar">
            <div
              className="confidence-bar-fill"
              style={{
                width: `${analysis.confidence}%`,
                background: barColor,
              }}
            />
          </div>
        </div>

        <div className="target-prices">
          <div className="target-price">
            <div className="label">Target Price</div>
            <div className="value green">
              {analysis.targetPrice ? `$${analysis.targetPrice.toFixed(2)}` : 'N/A'}
            </div>
          </div>
          <div className="target-price">
            <div className="label">Stop Loss</div>
            <div className="value red">
              {analysis.stopLoss ? `$${analysis.stopLoss.toFixed(2)}` : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
