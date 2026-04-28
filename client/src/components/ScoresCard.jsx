import { BarChart3 } from 'lucide-react';

function ScoreRing({ score, color, label }) {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="score-item">
      <div className="score-label">{label}</div>
      <div className="score-ring">
        <svg viewBox="0 0 64 64">
          <circle className="track" />
          <circle
            className="fill"
            style={{
              stroke: color,
              strokeDasharray: circumference,
              strokeDashoffset: offset,
            }}
          />
        </svg>
        <div className="score-text" style={{ color }}>{score}</div>
      </div>
    </div>
  );
}

export default function ScoresCard({ analysis }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3><BarChart3 size={16} /> Analysis Scores</h3>
      </div>
      <div className="card-body">
        <div className="scores-grid">
          <ScoreRing
            score={analysis.fundamentalScore || 0}
            color="var(--accent-blue)"
            label="Fundamental"
          />
          <ScoreRing
            score={analysis.technicalScore || 0}
            color="var(--accent-purple)"
            label="Technical"
          />
          <ScoreRing
            score={analysis.overallScore || 0}
            color="var(--accent-green)"
            label="Overall"
          />
        </div>
      </div>
    </div>
  );
}
