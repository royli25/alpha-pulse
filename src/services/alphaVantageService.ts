// src/services/alphaVantageService.ts

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  timestamp: string;
}

interface TechnicalIndicator {
  symbol: string;
  indicator: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  timestamp: string;
}

interface IntradayData {
  symbol: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ProcessedMarketData {
  quote: StockQuote;
  technicals: TechnicalIndicator[];
  recentCandles: IntradayData[];
  signals: any[];
}

class AlphaVantageService {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60 * 1000; // 1 minute cache for quotes
  private readonly TECH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes for technical indicators
  private readonly RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 2000; // 2 seconds between retries
  private rateLimitQueue: number[] = [];

  // Major symbols to track
  private readonly TRACKED_SYMBOLS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
    'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'PYPL', 'UBER', 'ZOOM'
  ];

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Get real-time quote for a symbol with comprehensive debugging and fallback
   */
  async getQuote(symbol: string): Promise<StockQuote | null> {
    const cacheKey = `quote_${symbol}`;
    const cached = this.getCachedData(cacheKey, this.CACHE_TTL);
    
    if (cached) {
      console.log(`📊 Returning cached quote for ${symbol}`);
      return cached;
    }

    // For now, use mock data to avoid rate limiting issues
    console.log(`📊 Using mock quote for ${symbol} to avoid rate limiting`);
    const mockQuote = this.generateMockQuote(symbol);
    this.setCachedData(cacheKey, mockQuote, this.CACHE_TTL);
    return mockQuote;

    // TODO: Uncomment below when API key is working properly
    /*
    await this.enforceRateLimit();

    const url = `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`;

    try {
      console.log(` Fetching quote for ${symbol} from: ${url}`);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Debug: Log the actual response
      console.log(`🔍 Alpha Vantage response for ${symbol}:`, data);
      
      if (data['Error Message']) {
        throw new Error(`Alpha Vantage Error: ${data['Error Message']}`);
      }

      if (data['Note']) {
        console.warn('⚠️ Alpha Vantage rate limit warning:', data['Note']);
        return null;
      }

      // Check if Global Quote exists
      if (!data['Global Quote']) {
        console.error(`❌ No Global Quote data for ${symbol}. Response keys:`, Object.keys(data));
        console.error(`❌ Full response:`, data);
        return null;
      }

      const quote = this.parseQuoteData(data['Global Quote'], symbol);
      if (quote) {
        this.setCachedData(cacheKey, quote, this.CACHE_TTL);
      }
      
      return quote;

    } catch (error) {
      console.error(`❌ Failed to fetch quote for ${symbol}:`, error);
      return null;
    }
    */
  }

  /**
   * Get technical indicators for a symbol
   */
  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicator[]> {
    const cacheKey = `tech_${symbol}`;
    const cached = this.getCachedData(cacheKey, this.TECH_CACHE_TTL);
    
    if (cached) {
      console.log(`🔧 Returning cached technical data for ${symbol}`);
      return cached;
    }

    // For now, use mock data to avoid rate limiting issues
    console.log(`🔧 Using mock technical indicators for ${symbol} to avoid rate limiting`);
    const mockIndicators = this.generateMockTechnicalIndicators(symbol);
    this.setCachedData(cacheKey, mockIndicators, this.TECH_CACHE_TTL);
    return mockIndicators;

    // TODO: Uncomment below when API key is working properly
    /*
    const indicators: TechnicalIndicator[] = [];

    try {
      // Get RSI
      const rsi = await this.getRSI(symbol);
      if (rsi) indicators.push(rsi);

      // Get MACD
      const macd = await this.getMACD(symbol);
      if (macd) indicators.push(macd);

      // Get SMA
      const sma = await this.getSMA(symbol);
      if (sma) indicators.push(sma);

      this.setCachedData(cacheKey, indicators, this.TECH_CACHE_TTL);
      console.log(`✅ Retrieved ${indicators.length} technical indicators for ${symbol}`);
      
      return indicators;

    } catch (error) {
      console.error(`❌ Failed to fetch technical indicators for ${symbol}:`, error);
      return [];
    }
    */
  }

  /**
   * Get intraday data for volume analysis
   */
  async getIntradayData(symbol: string, interval: '1min' | '5min' | '15min' = '5min'): Promise<IntradayData[]> {
    const cacheKey = `intraday_${symbol}_${interval}`;
    const cached = this.getCachedData(cacheKey, this.CACHE_TTL);
    
    if (cached) {
      return cached;
    }

    // For now, use mock data to avoid rate limiting issues
    console.log(`📈 Using mock intraday data for ${symbol} to avoid rate limiting`);
    const mockCandles = this.generateMockIntradayData(symbol);
    this.setCachedData(cacheKey, mockCandles, this.CACHE_TTL);
    return mockCandles;

    // TODO: Uncomment below when API key is working properly
    /*
    await this.enforceRateLimit();

    const url = `${this.baseUrl}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${this.apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data['Error Message'] || data['Note']) {
        console.warn(`⚠️ Intraday data not available for ${symbol}`);
        return [];
      }

      const timeSeries = data[`Time Series (${interval})`];
      if (!timeSeries) return [];

      const candles = this.parseIntradayData(timeSeries, symbol);
      this.setCachedData(cacheKey, candles, this.CACHE_TTL);
      
      return candles;

    } catch (error) {
      console.error(`❌ Failed to fetch intraday data for ${symbol}:`, error);
      return [];
    }
    */
  }

  /**
   * Process market data for multiple symbols with comprehensive fallback
   */
  async processMarketData(symbols: string[]): Promise<ProcessedMarketData[]> {
    console.log(`🔄 Processing market data for ${symbols.length} symbols...`);
    
    const results: ProcessedMarketData[] = [];

    for (const symbol of symbols.slice(0, 5)) { // Limit to 5 symbols to respect rate limits
      try {
        console.log(`📊 Processing ${symbol}...`);

        // Get quote data (now using mock data)
        const quote = await this.getQuote(symbol);

        // Get technical indicators (now using mock data)
        const technicals = await this.getTechnicalIndicators(symbol);

        // Get recent intraday data (now using mock data)
        const recentCandles = await this.getIntradayData(symbol);

        // Generate technical signals
        const signals = this.generateTechnicalSignals(quote, technicals, recentCandles);

        results.push({
          quote,
          technicals,
          recentCandles: recentCandles.slice(0, 10), // Last 10 candles
          signals
        });

        // Small delay between symbols to respect rate limits
        await this.delay(500);

      } catch (error) {
        console.error(`❌ Error processing ${symbol}:`, error);
        continue;
      }
    }

    console.log(`✅ Processed market data for ${results.length} symbols`);
    return results;
  }

  /**
   * Generate trading signals from technical analysis
   */
  generateTechnicalSignals(quote: StockQuote, technicals: TechnicalIndicator[], candles: IntradayData[]): any[] {
    const signals: any[] = [];

    try {
      // RSI-based signals
      const rsi = technicals.find(t => t.indicator === 'RSI');
      if (rsi) {
        if (rsi.value < 30) {
          signals.push({
            id: `rsi_${quote.symbol}_${Date.now()}`,
            asset: quote.symbol,
            type: 'BUY',
            confidence: Math.round((30 - rsi.value) * 2 + 60),
            timestamp: 'now',
            description: `RSI oversold at ${rsi.value.toFixed(1)} - potential reversal opportunity`,
            sources: ['technical'],
            indicator: 'RSI',
            value: rsi.value,
            price: quote.price,
            change: quote.changePercent
          });
        } else if (rsi.value > 70) {
          signals.push({
            id: `rsi_${quote.symbol}_${Date.now()}`,
            asset: quote.symbol,
            type: 'SELL',
            confidence: Math.round((rsi.value - 70) * 2 + 60),
            timestamp: 'now',
            description: `RSI overbought at ${rsi.value.toFixed(1)} - potential correction ahead`,
            sources: ['technical'],
            indicator: 'RSI',
            value: rsi.value,
            price: quote.price,
            change: quote.changePercent
          });
        }
      }

      // MACD-based signals
      const macd = technicals.find(t => t.indicator === 'MACD');
      if (macd && Math.abs(macd.value) > 0.5) {
        signals.push({
          id: `macd_${quote.symbol}_${Date.now()}`,
          asset: quote.symbol,
          type: macd.value > 0 ? 'BUY' : 'SELL',
          confidence: Math.round(Math.min(Math.abs(macd.value) * 20 + 60, 95)),
          timestamp: 'now',
          description: `MACD divergence at ${macd.value.toFixed(2)} - ${macd.value > 0 ? 'bullish' : 'bearish'} momentum`,
          sources: ['technical'],
          indicator: 'MACD',
          value: macd.value,
          price: quote.price,
          change: quote.changePercent
        });
      }

      // Volume-based signals
      if (candles.length > 0) {
        const avgVolume = candles.reduce((sum, c) => sum + c.volume, 0) / candles.length;
        const latestVolume = candles[0].volume;
        
        if (latestVolume > avgVolume * 1.5) {
          signals.push({
            id: `volume_${quote.symbol}_${Date.now()}`,
            asset: quote.symbol,
            type: quote.changePercent > 0 ? 'BUY' : 'SELL',
            confidence: Math.round(Math.min((latestVolume / avgVolume) * 20 + 60, 90)),
            timestamp: 'now',
            description: `High volume activity - ${Math.round(latestVolume / avgVolume)}x average volume`,
            sources: ['technical'],
            indicator: 'Volume',
            value: latestVolume,
            price: quote.price,
            change: quote.changePercent
          });
        }
      }

      // Price momentum signals
      if (Math.abs(quote.changePercent) > 3) {
        signals.push({
          id: `momentum_${quote.symbol}_${Date.now()}`,
          asset: quote.symbol,
          type: quote.changePercent > 0 ? 'BUY' : 'SELL',
          confidence: Math.round(Math.min(Math.abs(quote.changePercent) * 5 + 60, 95)),
          timestamp: 'now',
          description: `Strong ${quote.changePercent > 0 ? 'upward' : 'downward'} momentum - ${Math.abs(quote.changePercent).toFixed(1)}% move`,
          sources: ['technical'],
          indicator: 'Momentum',
          value: quote.changePercent,
          price: quote.price,
          change: quote.changePercent
        });
      }

    } catch (error) {
      console.error(`❌ Error generating signals for ${quote.symbol}:`, error);
    }

    return signals;
  }

  /**
   * Get symbols mentioned in news articles
   */
  extractSymbolsFromNews(newsArticles: any[]): string[] {
    const symbols = new Set<string>();
    
    newsArticles.forEach(article => {
      if (article.relevantSymbols) {
        article.relevantSymbols.forEach((symbol: string) => {
          if (this.TRACKED_SYMBOLS.includes(symbol)) {
            symbols.add(symbol);
          }
        });
      }
    });

    return Array.from(symbols);
  }

  // ===== PRIVATE HELPER METHODS =====

  private async getRSI(symbol: string): Promise<TechnicalIndicator | null> {
    await this.enforceRateLimit();
    
    const url = `${this.baseUrl}?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data['Error Message'] || data['Note']) return null;
      
      const rsiData = data['Technical Analysis: RSI'];
      if (!rsiData) return null;
      
      const latestDate = Object.keys(rsiData)[0];
      const rsiValue = parseFloat(rsiData[latestDate]['RSI']);
      
      return {
        symbol,
        indicator: 'RSI',
        value: rsiValue,
        signal: rsiValue < 30 ? 'BUY' : rsiValue > 70 ? 'SELL' : 'HOLD',
        timestamp: latestDate
      };
    } catch (error) {
      console.error(`❌ Failed to fetch RSI for ${symbol}:`, error);
      return null;
    }
  }

  private async getMACD(symbol: string): Promise<TechnicalIndicator | null> {
    await this.enforceRateLimit();
    
    const url = `${this.baseUrl}?function=MACD&symbol=${symbol}&interval=daily&series_type=close&apikey=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data['Error Message'] || data['Note']) return null;
      
      const macdData = data['Technical Analysis: MACD'];
      if (!macdData) return null;
      
      const latestDate = Object.keys(macdData)[0];
      const macd = parseFloat(macdData[latestDate]['MACD']);
      const signal = parseFloat(macdData[latestDate]['MACD_Signal']);
      
      return {
        symbol,
        indicator: 'MACD',
        value: macd - signal,
        signal: macd > signal ? 'BUY' : 'SELL',
        timestamp: latestDate
      };
    } catch (error) {
      console.error(`❌ Failed to fetch MACD for ${symbol}:`, error);
      return null;
    }
  }

  private async getSMA(symbol: string): Promise<TechnicalIndicator | null> {
    await this.enforceRateLimit();
    
    const url = `${this.baseUrl}?function=SMA&symbol=${symbol}&interval=daily&time_period=20&series_type=close&apikey=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data['Error Message'] || data['Note']) return null;
      
      const smaData = data['Technical Analysis: SMA'];
      if (!smaData) return null;
      
      const latestDate = Object.keys(smaData)[0];
      const smaValue = parseFloat(smaData[latestDate]['SMA']);
      
      // We'll need current price to compare
      const quote = await this.getQuote(symbol);
      if (!quote) return null;
      
      return {
        symbol,
        indicator: 'SMA_20',
        value: smaValue,
        signal: quote.price > smaValue ? 'BUY' : 'SELL',
        timestamp: latestDate
      };
    } catch (error) {
      console.error(`❌ Failed to fetch SMA for ${symbol}:`, error);
      return null;
    }
  }

  private parseQuoteData(data: any, symbol: string): StockQuote | null {
    try {
      // Debug: Log the data structure
      console.log(` Parsing quote data for ${symbol}:`, data);
      
      // Check if data exists and has the expected structure
      if (!data || typeof data !== 'object') {
        console.error(`❌ Invalid data structure for ${symbol}:`, data);
        return null;
      }

      // Validate required fields exist
      const requiredFields = ['05. price', '09. change', '10. change percent', '06. volume'];
      for (const field of requiredFields) {
        if (!data[field]) {
          console.error(`❌ Missing required field '${field}' for ${symbol}`);
          console.error(`❌ Available fields:`, Object.keys(data));
          return null;
        }
      }

      return {
        symbol,
        price: parseFloat(data['05. price']),
        change: parseFloat(data['09. change']),
        changePercent: parseFloat(data['10. change percent'].replace('%', '')),
        volume: parseInt(data['06. volume']),
        previousClose: parseFloat(data['08. previous close'] || '0'),
        open: parseFloat(data['02. open'] || '0'),
        high: parseFloat(data['03. high'] || '0'),
        low: parseFloat(data['04. low'] || '0'),
        timestamp: data['07. latest trading day'] || new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ Failed to parse quote data for ${symbol}:`, error);
      console.error(`❌ Data structure:`, data);
      return null;
    }
  }

  private parseIntradayData(timeSeries: any, symbol: string): IntradayData[] {
    const candles: IntradayData[] = [];
    
    try {
      Object.keys(timeSeries).slice(0, 20).forEach(timestamp => {
        const data = timeSeries[timestamp];
        candles.push({
          symbol,
          timestamp,
          open: parseFloat(data['1. open']),
          high: parseFloat(data['2. high']),
          low: parseFloat(data['3. low']),
          close: parseFloat(data['4. close']),
          volume: parseInt(data['5. volume'])
        });
      });
    } catch (error) {
      console.error(`❌ Failed to parse intraday data for ${symbol}:`, error);
    }
    
    return candles;
  }

  // ===== FALLBACK METHODS =====

  private generateMockQuote(symbol: string): StockQuote {
    const basePrice = 100 + Math.random() * 200;
    const change = (Math.random() - 0.5) * 10;
    const changePercent = (change / basePrice) * 100;
    
    return {
      symbol,
      price: basePrice,
      change: change,
      changePercent: changePercent,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      previousClose: basePrice - change,
      open: basePrice + (Math.random() - 0.5) * 5,
      high: basePrice + Math.random() * 10,
      low: basePrice - Math.random() * 10,
      timestamp: new Date().toISOString()
    };
  }

  private generateMockTechnicalIndicators(symbol: string): TechnicalIndicator[] {
    return [
      {
        symbol,
        indicator: 'RSI',
        value: 30 + Math.random() * 40, // Between 30-70
        signal: Math.random() > 0.5 ? 'BUY' : 'SELL',
        timestamp: new Date().toISOString()
      },
      {
        symbol,
        indicator: 'MACD',
        value: (Math.random() - 0.5) * 2,
        signal: Math.random() > 0.5 ? 'BUY' : 'SELL',
        timestamp: new Date().toISOString()
      },
      {
        symbol,
        indicator: 'SMA_20',
        value: 100 + Math.random() * 100,
        signal: Math.random() > 0.5 ? 'BUY' : 'SELL',
        timestamp: new Date().toISOString()
      }
    ];
  }

  private generateMockIntradayData(symbol: string): IntradayData[] {
    const candles: IntradayData[] = [];
    const basePrice = 100 + Math.random() * 100;
    
    for (let i = 0; i < 10; i++) {
      const open = basePrice + (Math.random() - 0.5) * 5;
      const high = open + Math.random() * 3;
      const low = open - Math.random() * 3;
      const close = open + (Math.random() - 0.5) * 2;
      
      candles.push({
        symbol,
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 1000000) + 100000
      });
    }
    
    return candles;
  }

  // ===== API VALIDATION =====

  async testApiKey(): Promise<boolean> {
    try {
      console.log('🔍 Testing Alpha Vantage API key...');
      const url = `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('🔍 API test response:', data);
      
      if (data['Error Message']) {
        console.error('❌ API key is invalid:', data['Error Message']);
        return false;
      }
      
      if (data['Note']) {
        console.warn('⚠️ API key is rate limited:', data['Note']);
        return false;
      }
      
      if (data['Global Quote']) {
        console.log('✅ API key is valid');
        return true;
      }
      
      console.error('❌ Unexpected API response format');
      return false;
    } catch (error) {
      console.error('❌ Failed to test API key:', error);
      return false;
    }
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    
    // Remove requests older than 1 minute
    this.rateLimitQueue = this.rateLimitQueue.filter(time => now - time < 60000);
    
    // Check if we're at the limit (5 requests per minute)
    if (this.rateLimitQueue.length >= 5) {
      const waitTime = Math.min(60000 - (now - this.rateLimitQueue[0]) + 1000, 10000); // Max 10 seconds wait
      console.log(`⏳ Rate limit reached, waiting ${waitTime}ms`);
      await this.delay(waitTime);
    }
    
    this.rateLimitQueue.push(now);
  }

  private getCachedData(key: string, ttl: number): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any, ttl: number): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export { 
  AlphaVantageService, 
  type StockQuote, 
  type TechnicalIndicator, 
  type IntradayData, 
  type ProcessedMarketData 
}; 