import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StockSearch } from '@/components/StockSearch';
import { Separator } from "@/components/ui/separator"
import { jsonDataService, type JsonSignalData } from '@/services/jsonDataService';
import { SignalCard } from "@/components/SignalCard"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Zap, 
  Users, 
  BarChart3,
  ArrowRight,
  Star,
  ChevronDown,
  ChevronUp,
  Shuffle
} from "lucide-react"
import sampleData from "@/data/sampleData.json"
import React, { useState } from "react"
import { useNewsData } from "@/hooks/useNewsData"

type Signal = {
  id: string
  asset: string
  type: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  timestamp: string
  description: string
  sources: Array<'news' | 'social' | 'technical'>
  price: string | number  // Allow both string and number
  change: number
  redditMentions?: number
  newsArticles?: number
  socialSentiment?: string
  indicator?: string      // Add this for technical indicators
  value?: number         // Add this for indicator values
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [stockSearchResults, setStockSearchResults] = useState<any[]>([]);
  const [jsonSignals, setJsonSignals] = useState<JsonSignalData[]>([]); // 新增：存储JSON数据
  const [shuffledSignals, setShuffledSignals] = useState<Signal[]>([]);
  const [allJsonSignals, setAllJsonSignals] = useState<Signal[]>([]);
  const [displayCount, setDisplayCount] = useState(12); 
  
  // 获取实时数据
  const { 
    articles, 
    signals: liveSignals, 
    marketData, 
    schedulerStatus,
    lastUpdated,
    error 
  } = useNewsData();

  // Keep sample data as fallback
  const { dashboardMetrics, signals: sampleSignals, marketNews } = sampleData;
  

  // Use live signals if available, otherwise fall back to sample data
  const displaySignals = liveSignals.length > 0 ? liveSignals : sampleSignals;
  const displayNews = articles.length > 0 ? articles : marketNews;
  
  // Convert live signals to match your existing Signal type
  const typedSignals = displaySignals.map(signal => ({
    ...signal,
    price: typeof signal.price === 'number'
      ? `$${signal.price.toFixed(2)}`
      : (signal.price || '$0.00'),
    change: signal.change || 0,
    redditMentions: signal.redditMentions || 0,
    newsArticles: signal.newsArticles || 0,
    socialSentiment: signal.socialSentiment || 'neutral'
  })) as Signal[];

  // Filter signals based on search term and filter type
  const filteredSignals = typedSignals.filter(signal => {
    const matchesSearch = signal.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         signal.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || signal.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Shuffle utility
  function shuffleArray(array: any[]) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // 简化的信号显示逻辑 - 修复版本
  let displaySignalsToShow = filteredSignals.slice(0, 6);
  if (filteredSignals.length < 6) {
    const additionalNeeded = 6 - filteredSignals.length;
    const sampleSignalsConverted = sampleSignals.map(signal => ({
      ...signal,
      price: signal.price || '$0.00',
      change: signal.change || 0,
      redditMentions: signal.redditMentions || 0,
      newsArticles: signal.newsArticles || 0,
      socialSentiment: signal.socialSentiment || 'neutral'
    })) as Signal[];
    
    const additionalSignals = sampleSignalsConverted.filter(signal =>
      !displaySignalsToShow.some(existing => existing.id === signal.id)
    );
    
    displaySignalsToShow = [
      ...displaySignalsToShow,
      ...additionalSignals.slice(0, additionalNeeded)
    ];
  }

  React.useEffect(() => {
    // 当refreshKey变化时重新洗牌
    shuffleAndDisplaySignals();
  }, [refreshKey, allJsonSignals, liveSignals, searchTerm, filterType]);
  
  const loadRealData = async () => {
    try {
      // 加载真实JSON数据
      const jsonData = await jsonDataService.loadAllJsonFiles();
      const convertedSignals = jsonData.map(data => ({
        id: data.data.id,
        asset: data.data.asset,
        type: data.data.type,
        confidence: data.data.confidence,
        timestamp: data.data.timestamp,
        description: data.data.description,
        sources: data.data.sources as Array<'news' | 'social' | 'technical'>,
        price: data.data.price,
        change: data.data.change,
        newsArticles: data.data.newsArticles || 0,
        socialSentiment: data.data.socialSentiment || 'neutral',
        redditMentions: 0,
        indicator: data.data.signal,
        value: data.data.confidence
      })) as Signal[];
      
      setAllJsonSignals(convertedSignals);
    } catch (error) {
      console.error('加载真实数据失败:', error);
      // 回退到样本数据
      const sampleSignalsConverted = sampleSignals.map(signal => ({
        ...signal,
        price: signal.price || '$0.00',
        change: signal.change || 0,
        redditMentions: signal.redditMentions || 0,
        newsArticles: signal.newsArticles || 0,
        socialSentiment: signal.socialSentiment || 'neutral'
      })) as Signal[];
      setAllJsonSignals(sampleSignalsConverted);
    }
  };
  
  // 将原来的6改为12或更多
  const DISPLAY_COUNT = 12; // 改为显示12个信号
  
  // 修复洗牌函数 - 替换原来的混乱代码
  const shuffleAndDisplaySignals = () => {
    let allSignals: Signal[] = [];

    // 优先使用JSON数据，如果没有则使用样本数据
    if (allJsonSignals.length > 0) {
      allSignals = [...allJsonSignals];
    } else {
      // 回退到样本数据
      const sampleSignalsConverted = sampleSignals.map(signal => ({
        ...signal,
        price: signal.price || '$0.00',
        change: signal.change || 0,
        redditMentions: signal.redditMentions || 0,
        newsArticles: signal.newsArticles || 0,
        socialSentiment: signal.socialSentiment || 'neutral'
      })) as Signal[];
      allSignals = sampleSignalsConverted;
    }

    // 如果有实时信号，添加到列表前面
    if (liveSignals.length > 0) {
      const liveConverted = liveSignals.map(signal => ({
        ...signal,
        type: signal.type || 'buy',
        confidence: signal.confidence || 85,
        price: signal.price || '$0.00',
        change: signal.change || 0,
        redditMentions: signal.redditMentions || 0,
        newsArticles: signal.newsArticles || 0,
        socialSentiment: signal.socialSentiment || 'neutral'
      })) as Signal[];

      // 将实时信号放在最前面
      allSignals = [...liveConverted, ...allSignals];
    }

    // 过滤信号
    const filtered = allSignals.filter(signal => {
      const matchesSearch = signal.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
        signal.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || signal.type.toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesFilter;
    });

    // 洗牌并设置显示
    const shuffled = shuffleArray(filtered);
    setShuffledSignals(shuffled);
  };
    

  const liveMetrics = {
    activeSignals: {
      value: liveSignals.length > 0 ? liveSignals.length : (allJsonSignals.length > 0 ? allJsonSignals.length : dashboardMetrics.activeSignals.value),
      change: liveSignals.length > 0 ? 23 : (allJsonSignals.length > 0 ? 15 : dashboardMetrics.activeSignals.change),
      changeType: "increase" as const,
      period: liveSignals.length > 0 ? "From live data" : (allJsonSignals.length > 0 ? "From JSON data" : dashboardMetrics.activeSignals.period)
    },
    avgConfidence: {
      value: liveSignals.length > 0 
        ? Number((liveSignals.reduce((sum, s) => sum + s.confidence, 0) / liveSignals.length).toFixed(1))
        : dashboardMetrics.avgConfidence.value,
      unit: "%",
      quality: "High",
      description: liveSignals.length > 0 ? "Live calculation" : dashboardMetrics.avgConfidence.description
    },
    marketSentiment: {
      value: articles.length > 0 
        ? (articles.filter(a => a.sentiment === 'positive').length > articles.filter(a => a.sentiment === 'negative').length ? 'Bullish' : 'Bearish')
        : dashboardMetrics.marketSentiment.value,
      change: articles.length > 0 ? 12 : dashboardMetrics.marketSentiment.change,
      changeType: "increase",
      source: articles.length > 0 ? "Live news sentiment" : dashboardMetrics.marketSentiment.source
    },
    portfolioImpact: {
      value: dashboardMetrics.portfolioImpact.value, // Keep this static for now
      currency: "USD",
      change: dashboardMetrics.portfolioImpact.change,
      changeType: "increase",
      period: dashboardMetrics.portfolioImpact.period
    }
  };

  const [newsCollapsed, setNewsCollapsed] = React.useState(false)

  return (
    <div className="space-y-8 p-6 pr-8 relative min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, Alex. Here's your market intelligence overview.
          </p>
        </div>
      </div>

      {/* KPI Row - Use live metrics but keep exact styling */}
      <div className="flex flex-row justify-between w-full gap-4 py-3 px-2 bg-transparent" style={{ fontSize: '0.5em' }}>
        {/* Active Signals */}
        <div className="space-y-2 flex-1">
          <div className="text-base font-semibold text-muted-foreground">Active Signals</div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-extrabold">{liveMetrics.activeSignals.value}</div>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-[1em] px-2 py-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{liveMetrics.activeSignals.change}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{liveMetrics.activeSignals.period}</p>
        </div>

        {/* Avg Confidence */}
        <div className="space-y-2 flex-1">
          <div className="text-base font-semibold text-muted-foreground">Avg Confidence</div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-extrabold">{liveMetrics.avgConfidence.value}{liveMetrics.avgConfidence.unit}</div>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[1em] px-2 py-1">
              <BarChart3 className="w-3 h-3 mr-1" />
              {liveMetrics.avgConfidence.quality}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{liveMetrics.avgConfidence.description}</p>
        </div>

        {/* Market Sentiment */}
        <div className="space-y-2 flex-1">
          <div className="text-base font-semibold text-muted-foreground">Market Sentiment</div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-extrabold">{liveMetrics.marketSentiment.value}</div>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-[1em] px-2 py-1">
              <Users className="w-3 h-3 mr-1" />
              +{liveMetrics.marketSentiment.change}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{liveMetrics.marketSentiment.source}</p>
        </div>

        {/* Portfolio Impact */}
        <div className="space-y-2 flex-1">
          <div className="text-base font-semibold text-muted-foreground">Portfolio Impact</div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-extrabold">+${(liveMetrics.portfolioImpact.value / 1000).toFixed(1)}K</div>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-[1em] px-2 py-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{liveMetrics.portfolioImpact.change}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{liveMetrics.portfolioImpact.period}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, Alex. Here's your market intelligence overview.
          </p>
        </div>
        <StockSearch
          onStockFound={(stockData) => setStockSearchResults(prev => [...prev, stockData])}
          className="ml-4"
        />
      </div>
      {stockSearchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Search Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stockSearchResults.map((stock, index) => (
              <SignalCard key={`${stock.symbol}-${index}`} signal={stock} />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Active Signals</h2>
        <div className="flex items-center space-x-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Signals</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
            <option value="hold">Hold</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshKey(prev => prev + 1)}
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {shuffledSignals.slice(0, displayCount).map((signal, index) => (
          <SignalCard
            key={`${signal.id}-${refreshKey}-${index}`}
            signal={signal}
          />
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Latest News</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNewsCollapsed(!newsCollapsed)}
          >
            {newsCollapsed ? (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Expand
              </>
            ) : (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Collapse
              </>
            )}
          </Button>
        </div>
        
        {!newsCollapsed && (
          <div className="grid gap-4">
            {displayNews.slice(0, 5).map((article, index) => (
              <Card key={index} className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{article.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {article.summary || article.content?.substring(0, 100) + '...'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{article.source}</span>
                        <span>{new Date(article.publishedAt || article.timestamp).toLocaleDateString()}</span>
                        {article.sentiment && (
                          <Badge 
                            variant={article.sentiment === 'positive' ? 'default' : 'secondary'}
                            className={article.sentiment === 'positive' ? 'bg-green-500' : article.sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-500'}
                          >
                            {article.sentiment}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
