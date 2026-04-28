import { TrendingUp } from 'lucide-react';

export default function Header() {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="logo-icon">
          <TrendingUp size={20} color="white" />
        </div>
        <h1>Stock<span>AI</span> Agent</h1>
      </div>
      <span className="header-tag">Agentic AI</span>
    </header>
  );
}
