import { TrendingUp, TrendingDown } from 'lucide-react';

export default function PriceHeader({ data }) {
  const { symbol, companyName, exchange, price } = data;
  const isPositive = price.change >= 0;

  return (
    <div className="card">
      <div className="price-header">
        <div className="price-info">
          <h2>{symbol}</h2>
          <div className="company-name">{companyName}</div>
          <div className="exchange">{exchange}</div>
        </div>
        <div className="price-value">
          <div className="current-price">${price.current?.toFixed(2)}</div>
          <div className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {isPositive ? '+' : ''}{price.change?.toFixed(2)} ({isPositive ? '+' : ''}{price.changePercent?.toFixed(2)}%)
          </div>
        </div>
      </div>
    </div>
  );
}
