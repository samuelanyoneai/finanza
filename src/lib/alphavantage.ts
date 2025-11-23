const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const API_URL = 'https://www.alphavantage.co/query';

export interface StockData {
  symbol: string;
  price: number;
  currency: string;
  timestamp: string;
  change: number;
  changePercent: number;
}

export async function getStockData(symbol: string): Promise<StockData> {
  try {
    const response = await fetch(
      `${API_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data['Note']) {
      throw new Error('API rate limit exceeded. Please try again in a moment.');
    }

    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    const quote = data['Global Quote'];

    if (!quote || Object.keys(quote).length === 0) {
      throw new Error(`Stock symbol "${symbol}" not found`);
    }

    return {
      symbol: quote['01. symbol'] || symbol,
      price: parseFloat(quote['05. price']) || 0,
      currency: quote['08. currency'] || 'USD',
      timestamp: new Date().toISOString(),
      change: parseFloat(quote['09. change']) || 0,
      changePercent: parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
    };
  } catch (error) {
    throw new Error(
      `Error fetching stock data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function getTimeSeries(symbol: string, interval: 'WEEKLY' | 'DAILY' = 'WEEKLY') {
  try {
    const functionName = interval === 'WEEKLY' ? 'TIME_SERIES_WEEKLY' : 'TIME_SERIES_DAILY';
    const response = await fetch(
      `${API_URL}?function=${functionName}&symbol=${symbol}&apikey=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data['Note']) {
      throw new Error('API rate limit exceeded. Please try again in a moment.');
    }

    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    const timeSeriesKey = Object.keys(data).find((key) => key.startsWith('Time Series'));

    if (!timeSeriesKey || !data[timeSeriesKey]) {
      throw new Error(`No time series data found for "${symbol}"`);
    }

    const timeSeries = data[timeSeriesKey];
    const dates = Object.keys(timeSeries).slice(0, 5);

    return {
      symbol,
      interval,
      data: dates.map((date) => ({
        date,
        open: parseFloat(timeSeries[date]['1. open']),
        high: parseFloat(timeSeries[date]['2. high']),
        low: parseFloat(timeSeries[date]['3. low']),
        close: parseFloat(timeSeries[date]['4. close']),
      })),
    };
  } catch (error) {
    throw new Error(
      `Error fetching time series: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
