import { CheckCircle } from 'lucide-react';

export default function ReasonsCard({ reasons }) {
  if (!reasons?.length) return null;

  return (
    <div className="card">
      <div className="card-header">
        <h3><CheckCircle size={16} /> Key Reasons</h3>
      </div>
      <div className="card-body">
        <div className="reasons-list">
          {reasons.map((reason, i) => (
            <div key={i} className="reason-item">
              <div className="reason-number">{i + 1}</div>
              <div className="reason-text">{reason}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
