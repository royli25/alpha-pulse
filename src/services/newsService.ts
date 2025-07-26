// src/services/newsService.ts

interface NewsArticle {
    source: {
      id: string | null;
      name: string;
    };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
  }
  
  interface NewsAPIResponse {
    status: string;
    totalResults: number;
    articles: NewsArticle[];
  }
  
  interface ProcessedNewsData {
    id: string;
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    relevantSymbols: string[];
    confidence: number;
  }
  
  export class NewsService {
    private apiKey: string;
    private baseUrl: string = 'https://newsapi.org/v2';
    private cache: Map<string, { data: any; timestamp: number }> = new Map();
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    private readonly RETRY_ATTEMPTS = 3;
    private readonly RETRY_DELAY = 1000; // 1 second
  
    // Financial keywords for filtering relevant news
    private readonly FINANCIAL_KEYWORDS = [
      'earnings', 'revenue', 'profit', 'stock', 'shares', 'market', 'financial',
      'investment', 'trading', 'analyst', 'upgrade', 'downgrade', 'guidance',
      'quarterly', 'annual', 'SEC', 'FDA', 'merger', 'acquisition', 'IPO'
    ];
  
    // Major stock symbols to track
    private readonly TRACKED_SYMBOLS = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 
      'ORCL', 'CRM', 'AMD', 'INTC', 'ADBE', 'PYPL', 'UBER', 'ZOOM'
    ];
  
    constructor(apiKey: string) {
      this.apiKey = apiKey;
    }
  
    /**
     * Fetch financial news from NewsAPI with retry logic
     */
    async fetchFinancialNews(query: string = 'financial markets', pageSize: number = 50): Promise<NewsAPIResponse> {
      const cacheKey = `news_${query}_${pageSize}`;
      
      // Check cache first
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        console.log('📰 Returning cached news data');
        return cached;
      }
  
      const url = `${this.baseUrl}/everything`;
      const params = new URLSearchParams({
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: pageSize.toString(),
        apiKey: this.apiKey,
        domains: 'reuters.com,bloomberg.com,cnbc.com,marketwatch.com,yahoo.com,wsj.com'
      });
  
      for (let attempt = 1; attempt <= this.RETRY_ATTEMPTS; attempt++) {
        try {
          console.log(`📰 Fetching news (attempt ${attempt}/${this.RETRY_ATTEMPTS})`);
          
          const response = await fetch(`${url}?${params}`);
          
          if (!response.ok) {
            if (response.status === 429) {
              console.warn('⚠️ Rate limit hit, waiting before retry...');
              await this.delay(this.RETRY_DELAY * attempt);
              continue;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
  
          const data: NewsAPIResponse = await response.json();
          
          if (data.status !== 'ok') {
            throw new Error(`NewsAPI Error: ${data.status}`);
          }
  
          // Cache the successful response
          this.setCachedData(cacheKey, data);
          console.log(`✅ Successfully fetched ${data.articles.length} news articles`);
          
          return data;
  
        } catch (error) {
          console.error(`❌ Attempt ${attempt} failed:`, error);
          
          if (attempt === this.RETRY_ATTEMPTS) {
            throw new Error(`Failed to fetch news after ${this.RETRY_ATTEMPTS} attempts: ${error}`);
          }
          
          await this.delay(this.RETRY_DELAY * attempt);
        }
      }
  
      throw new Error('Unexpected error in news fetching');
    }
  
    /**
     * Process raw news articles into structured data with sentiment analysis
     */
    async processNewsData(articles: NewsArticle[]): Promise<ProcessedNewsData[]> {
      console.log(`🔄 Processing ${articles.length} news articles...`);
      
      const processedArticles: ProcessedNewsData[] = [];
  
      for (const article of articles) {
        try {
          // Filter for financial relevance
          if (!this.isFinanciallyRelevant(article)) {
            continue;
          }
  
          const processed: ProcessedNewsData = {
            id: this.generateArticleId(article),
            title: article.title,
            description: article.description || '',
            url: article.url,
            source: article.source.name,
            publishedAt: article.publishedAt,
            sentiment: this.analyzeSentiment(article),
            relevantSymbols: this.extractRelevantSymbols(article),
            confidence: this.calculateConfidence(article)
          };
  
          processedArticles.push(processed);
  
        } catch (error) {
          console.error('❌ Error processing article:', error);
          continue;
        }
      }
  
      console.log(`✅ Processed ${processedArticles.length} relevant financial articles`);
      return processedArticles;
    }
  
    /**
     * Generate trading signals based on news sentiment
     */
    generateNewsSignals(processedNews: ProcessedNewsData[]): any[] {
      console.log('🎯 Generating trading signals from news data...');
      
      const signals: any[] = [];
      
      // Group news by symbol
      const newsBySymbol = this.groupNewsBySymbol(processedNews);
      
      for (const [symbol, articles] of newsBySymbol.entries()) {
        try {
          const signal = this.analyzeSymbolNews(symbol, articles);
          if (signal) {
            signals.push(signal);
          }
        } catch (error) {
          console.error(`❌ Error generating signal for ${symbol}:`, error);
        }
      }
  
      console.log(`✅ Generated ${signals.length} news-based signals`);
      return signals;
    }
  
    /**
     * Main method to collect and process news data
     */
    async collectNewsData(): Promise<{ articles: ProcessedNewsData[]; signals: any[] }> {
      try {
        console.log('🚀 Starting news data collection...');
        
        // Fetch raw news data
        const newsResponse = await this.fetchFinancialNews();
        
        // Process articles
        const processedArticles = await this.processNewsData(newsResponse.articles);
        
        // Generate signals
        const signals = this.generateNewsSignals(processedArticles);
        
        console.log('✅ News data collection completed successfully');
        
        return {
          articles: processedArticles,
          signals: signals
        };
  
      } catch (error) {
        console.error('❌ News data collection failed:', error);
        throw error;
      }
    }
  
    // ===== PRIVATE HELPER METHODS =====
  
    private getCachedData(key: string): any {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }
      this.cache.delete(key);
      return null;
    }
  
    private setCachedData(key: string, data: any): void {
      this.cache.set(key, { data, timestamp: Date.now() });
    }
  
    private delay(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    private generateArticleId(article: NewsArticle): string {
      return `news_${Date.now()}_${article.url.slice(-10)}`;
    }
  
    private isFinanciallyRelevant(article: NewsArticle): boolean {
      const text = `${article.title} ${article.description || ''}`.toLowerCase();
      return this.FINANCIAL_KEYWORDS.some(keyword => text.includes(keyword)) ||
             this.TRACKED_SYMBOLS.some(symbol => text.includes(symbol.toLowerCase()));
    }
  
    private analyzeSentiment(article: NewsArticle): 'positive' | 'negative' | 'neutral' {
      const text = `${article.title} ${article.description || ''}`.toLowerCase();
      
      const positiveWords = ['up', 'rise', 'gain', 'growth', 'profit', 'beat', 'exceed', 'strong', 'bullish', 'upgrade'];
      const negativeWords = ['down', 'fall', 'loss', 'decline', 'miss', 'weak', 'bearish', 'downgrade', 'concern', 'risk'];
      
      const positiveCount = positiveWords.filter(word => text.includes(word)).length;
      const negativeCount = negativeWords.filter(word => text.includes(word)).length;
      
      if (positiveCount > negativeCount) return 'positive';
      if (negativeCount > positiveCount) return 'negative';
      return 'neutral';
    }
  
    private extractRelevantSymbols(article: NewsArticle): string[] {
      const text = `${article.title} ${article.description || ''}`.toUpperCase();
      
      // Enhanced symbol mapping - company names to tickers
      const symbolMappings = {
        'OPENDOOR': 'OPEN',
        'LAMB WESTON': 'LW', 
        'GOLDMAN SACHS': 'GS',
        'HAMILTON': 'HMI',
        'APPLE': 'AAPL',
        'MICROSOFT': 'MSFT',
        'GOOGLE': 'GOOGL',
        'ALPHABET': 'GOOGL',
        'TESLA': 'TSLA',
        'META': 'META',
        'FACEBOOK': 'META',
        'NVIDIA': 'NVDA',
        'UBER': 'UBER',
        'AMAZON': 'AMZN',
        'NETFLIX': 'NFLX',
        'ORACLE': 'ORCL',
        'SALESFORCE': 'CRM',
        'ADOBE': 'ADBE',
        'PAYPAL': 'PYPL',
        'ZOOM': 'ZM',
        'INTEL': 'INTC',
        'AMD': 'AMD',
        'ADVANCED MICRO DEVICES': 'AMD'
      };
      
      const foundSymbols = new Set<string>();
      
      // Check direct symbol matches first
      this.TRACKED_SYMBOLS.forEach(symbol => {
        if (text.includes(symbol)) {
          foundSymbols.add(symbol);
        }
      });
      
      // Check company name mappings
      Object.entries(symbolMappings).forEach(([company, symbol]) => {
        if (text.includes(company)) {
          foundSymbols.add(symbol);
        }
      });
      
      const symbols = Array.from(foundSymbols);
      
      // Debug logging to verify extraction
      console.log(`🔍 Article: "${article.title.substring(0, 60)}..."`);
      console.log(`🔍 Text analyzed: "${text.substring(0, 100)}..."`);
      console.log(`🔍 Symbols found: ${symbols.join(', ') || 'NONE'}`);
      
      return symbols;
    }
  
    private calculateConfidence(article: NewsArticle): number {
      let confidence = 50; // base confidence
      
      // Boost confidence for reputable sources
      const reputableSources = ['Reuters', 'Bloomberg', 'CNBC', 'MarketWatch'];
      if (reputableSources.includes(article.source.name)) {
        confidence += 20;
      }
      
      // Boost for recent articles
      const hoursOld = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
      if (hoursOld < 1) confidence += 15;
      else if (hoursOld < 6) confidence += 10;
      
      return Math.min(confidence, 95);
    }
  
    private groupNewsBySymbol(articles: ProcessedNewsData[]): Map<string, ProcessedNewsData[]> {
      const grouped = new Map<string, ProcessedNewsData[]>();
      
      for (const article of articles) {
        for (const symbol of article.relevantSymbols) {
          if (!grouped.has(symbol)) {
            grouped.set(symbol, []);
          }
          grouped.get(symbol)!.push(article);
        }
      }
      
      return grouped;
    }
  
    private analyzeSymbolNews(symbol: string, articles: ProcessedNewsData[]): any | null {
      if (articles.length === 0) return null;
      
      // Calculate sentiment score
      let sentimentScore = 0;
      let totalConfidence = 0;
      
      for (const article of articles) {
        const weight = article.confidence / 100;
        totalConfidence += weight;
        
        if (article.sentiment === 'positive') sentimentScore += weight;
        else if (article.sentiment === 'negative') sentimentScore -= weight;
      }
      
      const avgSentiment = totalConfidence > 0 ? sentimentScore / totalConfidence : 0;
      const avgConfidence = totalConfidence / articles.length;
      
      // Generate signal only if confidence is high enough
      if (avgConfidence < 0.6 || Math.abs(avgSentiment) < 0.3) {
        return null;
      }
      
      return {
        id: `news_${symbol}_${Date.now()}`,
        asset: symbol,
        type: avgSentiment > 0 ? 'BUY' : 'SELL',
        confidence: Math.round(avgConfidence * 100),
        timestamp: 'now',
        description: `News sentiment analysis: ${articles.length} articles with ${avgSentiment > 0 ? 'positive' : 'negative'} sentiment`,
        sources: ['news'],
        newsArticles: articles.length,
        socialSentiment: avgSentiment > 0 ? 'positive' : 'negative'
      };
    }
  }
  
  export type { ProcessedNewsData, NewsArticle };