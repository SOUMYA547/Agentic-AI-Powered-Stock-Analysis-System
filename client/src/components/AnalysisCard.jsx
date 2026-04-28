import { Brain } from 'lucide-react';

export default function AnalysisCard({ analysis }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3><Brain size={16} /> AI Deep Analysis</h3>
      </div>
      <div className="card-body">
        <div className="analysis-sections">
          <div className="analysis-section">
            <h4 className="fundamental">Fundamental Analysis</h4>
            <p>{analysis.fundamentalAnalysis || 'N/A'}</p>
          </div>
          <div className="analysis-section">
            <h4 className="technical">Technical Analysis</h4>
            <p>{analysis.technicalAnalysis || 'N/A'}</p>
          </div>
          <div className="analysis-section">
            <h4 className="risk">Risk Analysis</h4>
            <p>{analysis.riskAnalysis || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
