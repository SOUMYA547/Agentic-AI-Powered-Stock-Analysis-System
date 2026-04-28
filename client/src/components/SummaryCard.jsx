import { FileText } from 'lucide-react';

export default function SummaryCard({ analysis }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3><FileText size={16} /> Final Verdict</h3>
      </div>
      <div className="card-body">
        <div className="summary-box">
          <p>{analysis.summary || 'No summary available.'}</p>
        </div>
      </div>
    </div>
  );
}
