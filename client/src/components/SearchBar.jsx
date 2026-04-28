import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ onSearch, loading }) {
  const [symbol, setSymbol] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = symbol.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  };

  return (
    <div className="search-container">
      <form className="search-bar" onSubmit={handleSubmit}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Enter stock ticker (e.g. AAPL, TSLA, GOOGL)..."
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !symbol.trim()}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>
    </div>
  );
}
