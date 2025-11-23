import React, { useState } from 'react';
import { Search, Loader, TrendingUp, TrendingDown } from 'lucide-react';
import { getStockData } from '../lib/alphavantage';
import type { StockData } from '../lib/alphavantage';

interface StockSearchProps {
  onSelectStock: (stock: StockData) => void;
}

export const StockSearch: React.FC<StockSearchProps> = ({ onSelectStock }) => {
  const [symbol, setSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentStocks, setRecentStocks] = useState<StockData[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const stock = await getStockData(symbol.toUpperCase());
      setRecentStocks([stock, ...recentStocks.filter((s) => s.symbol !== stock.symbol)].slice(0, 5));
      onSelectStock(stock);
      setSymbol('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching stock data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Buscar símbolo (ej: AAPL, GOOGL, IBM)..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !symbol.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {recentStocks.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          <p className="text-xs font-semibold text-gray-600 mb-2">Acciones recientes</p>
          {recentStocks.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => onSelectStock(stock)}
              className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{stock.symbol}</p>
                  <p className="text-sm text-gray-600">${stock.price.toFixed(2)}</p>
                </div>
                <div className={`flex items-center gap-1 ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="text-sm font-semibold">{stock.changePercent.toFixed(2)}%</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
