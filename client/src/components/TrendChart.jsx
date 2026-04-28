import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Line, ComposedChart, Bar
} from 'recharts';
import { LineChart as LineIcon } from 'lucide-react';

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

export default function TrendChart({ historical, indicators }) {
  const [view, setView] = useState('price');

  // Merge historical with SMA data
  const chartData = historical.map((h) => {
    const sma5 = indicators.sma5?.find(s => s.date === h.date);
    const sma20 = indicators.sma20?.find(s => s.date === h.date);
    const bb = indicators.bollinger?.find(s => s.date === h.date);
    return {
      date: h.date.slice(5), // MM-DD
      close: h.close,
      open: h.open,
      high: h.high,
      low: h.low,
      volume: h.volume,
      sma5: sma5?.value,
      sma20: sma20?.value,
      bbUpper: bb?.upper,
      bbMiddle: bb?.middle,
      bbLower: bb?.lower,
    };
  });

  return (
    <div className="card">
      <div className="card-header">
        <h3><LineIcon size={16} /> 15-Day Price Trend</h3>
        <div className="chart-tabs">
          <button
            className={`chart-tab ${view === 'price' ? 'active' : ''}`}
            onClick={() => setView('price')}
          >Price + SMA</button>
          <button
            className={`chart-tab ${view === 'bollinger' ? 'active' : ''}`}
            onClick={() => setView('bollinger')}
          >Bollinger</button>
          <button
            className={`chart-tab ${view === 'volume' ? 'active' : ''}`}
            onClick={() => setView('volume')}
          >Volume</button>
        </div>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          {view === 'volume' ? (
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="volume" fill="#3b82f6" opacity={0.6} name="Volume" />
              <Line type="monotone" dataKey="close" stroke="#10b981" dot={false} strokeWidth={2} name="Close" yAxisId={1} />
              <YAxis yAxisId={1} orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} />
            </ComposedChart>
          ) : view === 'bollinger' ? (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="bbUpper" stroke="#6366f1" fill="#6366f1" fillOpacity={0.05} name="BB Upper" />
              <Area type="monotone" dataKey="bbLower" stroke="#6366f1" fill="#6366f1" fillOpacity={0.05} name="BB Lower" />
              <Line type="monotone" dataKey="close" stroke="#10b981" dot={false} strokeWidth={2} name="Close" />
              <Line type="monotone" dataKey="bbMiddle" stroke="#6366f1" dot={false} strokeWidth={1} strokeDasharray="4 4" name="BB Middle" />
            </AreaChart>
          ) : (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="close"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorClose)"
                name="Close"
              />
              <Line type="monotone" dataKey="sma5" stroke="#f59e0b" dot={false} strokeWidth={1.5} name="SMA(5)" />
              <Line type="monotone" dataKey="sma20" stroke="#3b82f6" dot={false} strokeWidth={1.5} name="SMA(20)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
