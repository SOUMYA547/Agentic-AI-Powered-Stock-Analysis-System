import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell
} from 'recharts';
import { Activity } from 'lucide-react';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a2332',
      border: '1px solid #2a3548',
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 12,
    }}>
      <div style={{ color: '#94a3b8', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </div>
      ))}
    </div>
  );
}

export default function AnalyzerChart({ indicators }) {
  const [tab, setTab] = useState('rsi');

  const rsiData = indicators.rsi?.map(r => ({
    date: r.date.slice(5),
    RSI: r.value,
  })) || [];

  const macdData = indicators.macd?.macdLine?.map((m, i) => {
    const signal = indicators.macd.signalLine?.find(s => s.date === m.date);
    const hist = indicators.macd.histogram?.find(h => h.date === m.date);
    return {
      date: m.date.slice(5),
      MACD: m.value,
      Signal: signal?.value,
      Histogram: hist?.value,
    };
  }) || [];

  const currentValues = indicators.currentValues || {};

  return (
    <div className="card">
      <div className="card-header">
        <h3><Activity size={16} /> Technical Analyzer</h3>
        <div className="chart-tabs">
          <button className={`chart-tab ${tab === 'rsi' ? 'active' : ''}`} onClick={() => setTab('rsi')}>RSI</button>
          <button className={`chart-tab ${tab === 'macd' ? 'active' : ''}`} onClick={() => setTab('macd')}>MACD</button>
          <button className={`chart-tab ${tab === 'summary' ? 'active' : ''}`} onClick={() => setTab('summary')}>Summary</button>
        </div>
      </div>
      {tab === 'summary' ? (
        <div className="card-body">
          <div className="tech-values-grid">
            <div className="tech-value-item">
              <div className="tv-label">RSI (14)</div>
              <div className="tv-value" style={{
                color: currentValues.rsi > 70 ? 'var(--accent-red)' :
                       currentValues.rsi < 30 ? 'var(--accent-green)' :
                       'var(--text-primary)'
              }}>
                {currentValues.rsi?.toFixed(1) || 'N/A'}
              </div>
            </div>
            <div className="tech-value-item">
              <div className="tv-label">MACD</div>
              <div className="tv-value" style={{
                color: currentValues.macd > 0 ? 'var(--accent-green)' : 'var(--accent-red)'
              }}>
                {currentValues.macd?.toFixed(2) || 'N/A'}
              </div>
            </div>
            <div className="tech-value-item">
              <div className="tv-label">Volume</div>
              <div className="tv-value" style={{
                color: currentValues.volumeTrend === 'Increasing' ? 'var(--accent-green)' :
                       currentValues.volumeTrend === 'Decreasing' ? 'var(--accent-red)' :
                       'var(--text-primary)'
              }}>
                {currentValues.volumeTrend || 'N/A'}
              </div>
            </div>
            <div className="tech-value-item">
              <div className="tv-label">SMA (5)</div>
              <div className="tv-value">{currentValues.sma5?.toFixed(2) || 'N/A'}</div>
            </div>
            <div className="tech-value-item">
              <div className="tv-label">SMA (20)</div>
              <div className="tv-value">{currentValues.sma20?.toFixed(2) || 'N/A'}</div>
            </div>
            <div className="tech-value-item">
              <div className="tv-label">Trend</div>
              <div className="tv-value" style={{
                color: currentValues.sma5 > currentValues.sma20 ? 'var(--accent-green)' : 'var(--accent-red)'
              }}>
                {currentValues.sma5 > currentValues.sma20 ? 'Bullish' : 'Bearish'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            {tab === 'rsi' ? (
              <LineChart data={rsiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Overbought', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Oversold', fill: '#10b981', fontSize: 10 }} />
                <Line type="monotone" dataKey="RSI" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            ) : (
              <BarChart data={macdData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Histogram" name="Histogram">
                  {macdData.map((entry, i) => (
                    <Cell key={i} fill={entry.Histogram >= 0 ? '#10b981' : '#ef4444'} opacity={0.7} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="MACD" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Signal" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
